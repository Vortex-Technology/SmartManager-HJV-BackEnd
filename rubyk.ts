import { Config } from '@rubykgen/rubyk-cli'

export const config: Config = {
  generators: [
    {
      test: 'unit',
      name: '-{^file}--{^module}--{^type}-',
      filename: '-{^file}--{^module}-.-{type}-',
      pattern: './src/modules/-{module}-/-{type}-s/',
      type: 'service',
      alias: 's',
      annotations: ['Injectable'],
      interfaces: ['Request'],
      methods: [
        {
          name: 'execute',
          properties: [
            {
              name: '{ }',
              type: ['Request'],
            },
          ],
          returns: {
            type: [
              {
                name: 'Promise',
                generics: [
                  {
                    name: 'Response',
                  },
                ],
              },
            ],
          },
        },
      ],
      imports: [
        {
          imports: ['Either'],
          from: '@shared/core/errors',
        },
      ],
      types: [
        {
          name: 'Response',
          receive: [
            {
              name: 'Either',
              generics: ['null', 'null'],
            },
          ],
        },
      ],
    },
    {
      test: 'e2e',
      name: '-{^file}--{^module}--{^type}-',
      filename: '-{^file}--{^module}-.-{type}-',
      pattern: './src/modules/-{module}-/-{type}-s/',
      type: 'controller',
      alias: 'c',
      annotations: ['Controller'],
      methods: [
        {
          name: 'handle',
          annotations: ['HttpCode', 'Post'],
          properties: [
            {
              annotation: 'Body',
              name: 'body',
              type: ['-{^file}--{^module}-Body'],
            },
          ],
        },
      ],
      imports: [
        {
          imports: [
            '-{^file}--{^module}-Body',
            '-{file}--{^module}-BodyValidationPipe',
          ],
          from: '../gateways/-{^file}--{^module}-.gateway',
        },
        {
          imports: ['-{^file}--{^module}-Service'],
          from: '../services/-{^file}--{^module}-.service',
        },
        {
          imports: ['Body', 'Controller', 'Post', 'HttpCode'],
          from: '@nestjs/common',
        },
      ],
    },
    {
      name: '-{^module}-',
      type: 'entity',
      alias: 'e',
      pattern: './src/modules/-{module}-/entities/',
      filename: '-{^module}-',
      imports: [
        {
          imports: ['Optional'],
          from: '@shared/core/types/Optional',
        },
        {
          imports: ['AggregateRoot'],
          from: '@shared/core/entities/AggregateRoot',
        },
        {
          imports: ['UniqueEntityId'],
          from: '@shared/core/valueObjects/UniqueEntityId',
        },
      ],
      interfaces: [
        {
          name: '-{^module}-Props',
          export: true,
        },
      ],
      extends: [
        {
          name: 'AggregateRoot',
          generics: [
            {
              name: '-{^module}-Props',
            },
          ],
        },
      ],
      methods: [
        {
          name: 'create',
          properties: [
            {
              name: 'props',
              type: [
                {
                  name: 'Optional',
                  generics: [
                    {
                      name: '-{^module}-Props',
                    },
                    {
                      name: "'something'",
                    },
                  ],
                },
              ],
            },
            {
              name: 'id',
              type: ['UniqueEntityId'],
            },
          ],
          returns: {
            type: ['-{^module}-'],
          },
        },
      ],
    },
    {
      name: '-{^file}--{^module}-Gateway',
      type: 'gateway',
      filename: '-{^file}--{^module}-.gateway',
      alias: 'g',
      pattern: './src/modules/-{module}-/-{type}-s/',
      types: [
        {
          export: true,
          name: '-{^file}--{^module}-Body',
          receive: [
            {
              name: 'z.infer',
              generics: ['typeof  -{file}--{^module}-BodySchema'],
            },
          ],
        },
      ],
      imports: [
        {
          imports: ['z'],
          from: 'zod',
        },
      ],
    },
    {
      name: '-{^module}-Presenter',
      type: 'presenter',
      alias: 'p',
      filename: '-{^module}-Presenter',
      pattern: './src/modules/-{module}-/-{type}-s/',
      imports: [
        {
          imports: ['-{^module}-'],
          from: '../entities/-{^module}-',
        },
      ],
      methods: [
        {
          name: 'toHTTP',
          properties: [
            {
              name: '-{module}-',
              type: ['-{^module}-'],
            },
          ],
        },
      ],
    },
    {
      name: '-{^file}-Repository',
      type: 'repository contract',
      alias: 'rc',
      filename: '-{^file}-Repository',
      pattern: './src/modules/-{module}-/repositories/',
      test: 'disabled',
      imports: [
        {
          imports: ['-{^module}-'],
          from: '../entities/-{^module}-',
        },
      ],
    },
    {
      name: '-{^file}-PrismaRepository',
      type: 'repository implementation',
      alias: 'ri',
      filename: '-{^file}-PrismaRepository',
      pattern: './src/infra/database/prisma/-{module}-/',
      imports: [
        {
          imports: ['-{^module}-'],
          from: '@modules/-{module}-/entities/-{^module}-',
        },
        {
          imports: ['-{^file}-Repository'],
          from: '@modules/-{module}-/repositories/-{^file}-Repository',
        },
        {
          imports: ['PrismaService'],
          from: '../index.service',
        },
        {
          imports: ['-{^file}-PrismaMapper'],
          from: './-{^file}-PrismaMapper',
        },
        {
          imports: ['Injectable'],
          from: '@nestjs/common',
        },
      ],
      annotations: ['Injectable'],
      implements: ['-{^file}-Repository'],
    },
    {
      name: '-{^file}-PrismaMapper',
      type: 'repository implementation mapper',
      alias: 'rim',
      filename: '-{^file}-PrismaMapper',
      pattern: './src/infra/database/prisma/-{module}-/',
      imports: [
        {
          imports: ['-{^module}-'],
          from: '@modules/-{module}-/entities/-{^module}-',
        },
        {
          imports: ['Prisma', '-{^module}- as -{^module}-Prisma'],
          from: '@prisma/client',
        },
        {
          imports: ['UniqueEntityId'],
          from: '@shared/core/valueObjects/UniqueEntityId',
        },
      ],
      methods: [
        {
          name: 'toEntity',
          properties: [
            {
              name: 'raw',
              type: ['-{^module}-Prisma'],
            },
          ],
          returns: {
            type: ['-{^module}-'],
          },
        },
        {
          name: 'toPrisma',
          properties: [
            {
              name: '-{module}-',
              type: ['-{^module}-'],
            },
          ],
          returns: {
            type: ['Prisma.-{^module}-UncheckedCreateInput'],
          },
        },
      ],
    },
    {
      name: '-{^file}-',
      type: 'error',
      alias: 'err',
      filename: '-{^file}-',
      pattern: './src/modules/-{module}-/errors/',
      extends: ['Error'],
      implements: ['ServiceError'],
      imports: [
        {
          imports: ['ServiceError'],
          from: '@shared/core/errors/ServiceError',
        },
        {
          imports: ['statusCode'],
          from: '@config/statusCode',
        },
      ],
    },
  ],
}
