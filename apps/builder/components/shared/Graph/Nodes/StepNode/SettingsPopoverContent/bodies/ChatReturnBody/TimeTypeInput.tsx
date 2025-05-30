import Select, { Props as SelectProps } from 'react-select'

export const TimeTypeInput = (props: SelectProps) => {

  return (
    <Select
      menuPortalTarget={document.body}
      menuPosition="fixed"
      styles={{
        control: (base) => ({
          ...base,
          borderRadius: '0.5rem',
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 })
      }}
      {...props}
    />
  )
}
