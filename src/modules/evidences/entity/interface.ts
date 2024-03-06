export type Evidence = {
    title?: string
    project?: string
    participants: string[]
    description: string
    date?: string
    screenshot?: string
    attachment: string
    difficulty?: number
    isValid?: boolean
    source: string
}

export type EvidenceWithForm = {
    title: string
    project: string
    participants: string
    date: string
    screenshot: string
    attachment: string
    difficulty: number
    source: string
}
