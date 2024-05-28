import type { FlightRouterState } from '../../../../server/app-render/types'
import type { CacheNode } from '../../../../shared/lib/app-router-context.shared-runtime'
import { createRouterCacheKey } from '../create-router-cache-key'

export function findHeadInCache(
  cache: CacheNode,
  parallelRoutes: FlightRouterState[1]
): [CacheNode, string][] {
  return findHeadInCacheImpl(cache, parallelRoutes, '')
}

function findHeadInCacheImpl(
  cache: CacheNode,
  parallelRoutes: FlightRouterState[1],
  keyPrefix: string
): [CacheNode, string][] {
  const isLastItem = Object.keys(parallelRoutes).length === 0
  if (isLastItem) {
    // Returns the entire Cache Node of the segment whose head we will render.
    return [[cache, keyPrefix]]
  }

  // There can be multiple `head` segments associated with leaf nodes, as each parallel route can define its own head.
  // This accumulates all of the heads that need to be rendered.
  let results: [CacheNode, string][] = []

  for (const key in parallelRoutes) {
    const [segment, childParallelRoutes] = parallelRoutes[key]
    const childSegmentMap = cache.parallelRoutes.get(key)
    if (!childSegmentMap) {
      continue
    }

    const cacheKey = createRouterCacheKey(segment)

    const cacheNode = childSegmentMap.get(cacheKey)
    if (!cacheNode) {
      continue
    }

    const items = findHeadInCacheImpl(
      cacheNode,
      childParallelRoutes,
      keyPrefix + '/' + cacheKey
    )

    // if we found a head, add it to the list of discovered head nodes while continuing to search for more
    if (items.length > 0) {
      results = results.concat(items)
    }
  }

  return results
}
