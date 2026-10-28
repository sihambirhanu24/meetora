import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SearchResult {
  type: 'meeting' | 'workspace' | 'person';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  metadata?: any;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(userId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query.toLowerCase()}%`;
    const results: SearchResult[] = [];

    // Search meetings (where user is host or participant)
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
        ],
        AND: {
          OR: [
            {
              title: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
      },
      include: {
        host: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 5,
      orderBy: {
        startTime: 'desc',
      },
    });

    results.push(
      ...meetings.map((meeting) => ({
        type: 'meeting' as const,
        id: meeting.id,
        title: meeting.title,
        subtitle: `Hosted by ${meeting.host.firstName} ${meeting.host.lastName}`,
        url: `/meetings/${meeting.id}`,
        metadata: {
          startTime: meeting.startTime,
          status: meeting.status,
        },
      })),
    );

    // Search workspaces (where user is a member)
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      take: 5,
      orderBy: {
        name: 'asc',
      },
    });

    results.push(
      ...workspaces.map((workspace) => ({
        type: 'workspace' as const,
        id: workspace.id,
        title: workspace.name,
        subtitle: `${workspace._count.members} member${workspace._count.members !== 1 ? 's' : ''}`,
        url: `/workspaces/${workspace.id}`,
      })),
    );

    // Search people (users in same workspaces)
    const people = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId,
            },
          },
          {
            workspaceMemberships: {
              some: {
                workspace: {
                  members: {
                    some: {
                      userId,
                    },
                  },
                },
              },
            },
          },
          {
            OR: [
              {
                firstName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        profileImage: true,
      },
      take: 5,
      orderBy: {
        firstName: 'asc',
      },
    });

    results.push(
      ...people.map((person) => ({
        type: 'person' as const,
        id: person.id,
        title: `${person.firstName} ${person.lastName}`,
        subtitle: person.jobTitle || person.email,
        url: `/profile/${person.id}`,
        metadata: {
          email: person.email,
          profileImage: person.profileImage,
        },
      })),
    );

    return results;
  }
}
