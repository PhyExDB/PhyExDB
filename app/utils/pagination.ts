/**
 * Retrieves the pagination metadata from the current route.
 */
export function getPageMeta(){
    const route = useRoute()
    const pageMeta = {
    page: parseInt(route.query.page as string, 10) || 1,
    pageSize: parseInt(route.query.pageSize as string, 10) || 12,
    total: 0,
    totalPages: 0,
    }

    return pageMeta satisfies PageMeta
}

/**
 * Generates a query string from the given page metadata.
 */
export function getQueryFromPageMeta(pageMeta: PageMeta){
    return `page=${pageMeta.page}&pageSize=${pageMeta.pageSize}`
}
