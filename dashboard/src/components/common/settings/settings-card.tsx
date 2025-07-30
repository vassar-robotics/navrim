export const ConfigCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white py-2">
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 leading-none font-semibold">
          {icon}
          {title}
        </div>
      </div>
      {children}
    </div>
  )
}
