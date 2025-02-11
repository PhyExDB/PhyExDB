/**
 * Retrieves the slug parameter from the current route.
 */
export function getSlug(){
    const route = useRoute()
    return route.params.slug as string
}

/**
 * Retrieves the ID from the current route parameters.
 */
export function getId(){
    const route = useRoute()
    return route.params.id as string
}
