/**
 * Retrieves the pagination metadata from the current route.
 */
export function getRequestPageMeta(){
    const route = useRoute()
    return {
        page: ref(parseInt(route.query.page as string, 10) || 1),
        pageSize: ref(parseInt(route.query.pageSize as string, 10) || 12),
    }
}
