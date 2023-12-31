import { StorageAdapter } from "@automerge/automerge-repo"
import prisma from "../client.js"
import path from "path"

export class PostgresStorageAdapter extends StorageAdapter {
  /** @type typeof prisma */
  client

  /** @type { [key: string]: Uint8Array } */
  cache = {}

  /**
   *
   * @argument client {typeof prisma}
   */
  constructor(client) {
    super()
    this.client = client
  }

  /**
   * @argument keyArray {string[]}
   * @returns data Promise<Uint8Array | undefined>
   */
  async load(keyArray) {
    const key = getKey(keyArray)
    if (this.cache[key]) return this.cache[key]

    try {
      const response = await this.client.automergeStore.findFirst({
        where: { key },
      })
      if (!response) return undefined
      return new Uint8Array(response.value)
    } catch (error) {
      throw error
    }
  }

  /**
   * @argument keyArray {string[]}
   * @argument binary {Uint8Array}
   * @returns data Promise<void>
   */
  async save(keyArray, binary) {
    const key = getKey(keyArray)
    this.cache[key] = binary

    await this.client.automergeStore.upsert({
      where: { key },
      create: { key, value: Buffer.from(binary) },
      update: { value: Buffer.from(binary) },
    })
    return
  }

  /**
   * @argument keyArray {string[]}
   * @returns data Promise<void>
   */
  async remove(keyArray) {
    const key = getKey(keyArray)
    // remove from cache
    delete this.cache[key]
    await this.client.automergeStore.delete({ where: { key: key } })
  }

  /**
   * @argument keyPrefix {string[]}
   * @returns data Promise< {
      key: StorageKey;
      data: Uint8Array | undefined;
    }>
   */
  async loadRange(keyPrefix) {
    const cachedKeys = this.cachedKeys(keyPrefix)
    const storedKeys = await this.loadRangeKeys(keyPrefix)
    const allKeys = [...new Set([...cachedKeys, ...storedKeys])]

    const chunks = await Promise.all(
      allKeys.map(async (keyString) => {
        const key = keyString.split(path.sep)
        const data = await this.load(key)
        return { data, key }
      }),
    )

    return chunks
  }

  /**
   * @argument keyPrefix {string[]}
   * @returns data Promise<void>
   */
  async removeRange(keyPrefix) {
    const key = getKey(keyPrefix)
    this.cachedKeys(keyPrefix).forEach((key) => delete this.cache[key])
    await this.client.automergeStore.deleteMany({
      where: { key: { startsWith: key } },
    })
  }

  /**
   * @argument keyPrefix {string[]}
   * @returns string[]
   */
  cachedKeys(keyPrefix) {
    const cacheKeyPrefixString = getKey(keyPrefix)
    return Object.keys(this.cache).filter((key) =>
      key.startsWith(cacheKeyPrefixString),
    )
  }

  /**
   * @argument keyPrefix {string[]}
   * @returns Promise<string[]>
   */
  async loadRangeKeys(keyPrefix) {
    const response = await this.client.automergeStore.findMany({
      where: { key: { startsWith: getKey(keyPrefix) } },
      select: { key: true },
    })
    return response.map((row) => row.key)
  }
}

// HELPERS
const getKey = (key) => path.join(...key)
