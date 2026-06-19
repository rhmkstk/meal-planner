export default defineAppConfig({
  ui: {
    primary: 'herb',
    gray: 'stone',
    button: {
      rounded: 'rounded-md',
      font: 'font-semibold',
      color: {
        gray: {
          soft: 'ring-1 ring-inset ring-stone-200 text-stone-800 bg-stone-100 hover:bg-stone-200 disabled:bg-stone-100 aria-disabled:bg-stone-100 disabled:text-stone-500 aria-disabled:text-stone-500 dark:ring-stone-700 dark:text-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 dark:disabled:bg-stone-800 dark:aria-disabled:bg-stone-800 dark:disabled:text-stone-400 dark:aria-disabled:text-stone-400 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400'
        }
      },
      default: {
        size: 'md',
        color: 'primary'
      }
    },
    badge: {
      rounded: 'rounded-md',
      font: 'font-semibold'
    },
    card: {
      rounded: 'rounded-lg',
      shadow: 'shadow-soft',
      ring: 'ring-1 ring-meal-line dark:ring-stone-800',
      background: 'bg-meal-paper dark:bg-stone-900'
    },
    input: {
      rounded: 'rounded-md'
    },
    textarea: {
      rounded: 'rounded-md'
    },
    select: {
      rounded: 'rounded-md'
    },
    selectMenu: {
      width: 'w-[var(--popper-anchor-width)] max-w-[calc(100vw-2rem)]',
      background: 'bg-meal-paper dark:bg-stone-900',
      ring: 'ring-1 ring-meal-line dark:ring-stone-800',
      option: {
        active: 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300',
        selectedIcon: {
          base: 'h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0'
        }
      },
      arrow: {
        ring: 'before:ring-1 before:ring-meal-line dark:before:ring-stone-800',
        background: 'before:bg-meal-paper dark:before:bg-stone-900'
      }
    },
    checkbox: {
      rounded: 'rounded'
    }
  }
})
