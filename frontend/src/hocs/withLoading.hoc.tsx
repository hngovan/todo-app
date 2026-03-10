import { Suspense } from 'react'

import { Loader } from '@/components/ui/loader'

type ReturnType<T> = (props: T) => React.JSX.Element

export const withLoading = <T extends object>(
  Component: React.ComponentType<T>
): ReturnType<T> => {
  return (props: T) => (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader size="lg" />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  )
}
