import { Config } from '@rubykgen/rubyk-cli'

export const config: Config = {
  modules: [
    'user',
    ['company', 'companies'],
    'product',
    'market',
    'collaborator',
    ['inventory', 'inventories'],
    'address',
    'owner',
    'manager',
    'stockist',
    'seller',
    'order',
  ],
  plugins: ['infraGenerators', 'nestGenerators', 'prismaGenerators'],
}
