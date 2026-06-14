export interface ModalContent {
  icon: string
  title: string
  sections: { label: string; text: string }[]
  proof?: { text: string; source?: string }
}
