import { Suspense } from 'react'
import NewsletterUnsubscribePage from './unsubscribe-content'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sage-600">Laden …</p>}>
      <NewsletterUnsubscribePage />
    </Suspense>
  )
}
