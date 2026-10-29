import { Icon } from '@/people-plus/Icon'

/** The icon, title and one-line description at the top of every module page. */
export function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="pp-module-intro">
      <div className="pp-module-icon">
        <Icon name="grid" size={20} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </section>
  )
}
