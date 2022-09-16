import useOuterClick from 'hooks/useOuterClick'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import {
  Container,
  OptionGroup,
  OptionItem,
  DropDownIcon,
  Separator,
} from './OctaSelect.style'
import { OctaSelectProps } from './OctaSelect.type'

const OctaSelect = (props: OctaSelectProps) => {
  const [toggle, setToggle] = useState<boolean>(false)
  const [selected, setSelected] = useState<string>()
  const { ref, isComponentVisible, setIsComponentVisible } =
    useOuterClick(toggle)

  useEffect(() => {
    setIsComponentVisible(toggle)
  }, [toggle, setIsComponentVisible])

  useEffect(() => {
    const selectedUserGroup = props.items.filter(
      (item) =>
        props.defaultValue[0]?.label &&
        item.value.assignTo === props.defaultValue
    )[0]?.label
    setSelected(selectedUserGroup)
  }, [props.defaultValue])

  const handleSelect = (e: SyntheticEvent<HTMLLIElement>): void => {
    const dataValue = e.currentTarget.getAttribute('data-value')
    const dataLabel = e.currentTarget.getAttribute('data-label')
    if (dataValue && dataLabel) {
      props.onChange({
        value: dataValue,
        label: dataLabel,
      })
      setSelected(dataLabel)
    }
  }
  const handleToggle = (): void => {
    setToggle((e) => !e)
  }

  return (
    <Container ref={ref} onClick={handleToggle}>
      {!selected && props.placeholder}
      {selected && selected}
      <OptionGroup
        className={toggle && isComponentVisible ? 'opened' : ''}
        {...(props as any)}
      >
        {props.items.map((item, idx) => (
          <>
            {item && item?.isTitle && <Separator />}
            <OptionItem
              key={idx}
              data-value={JSON.stringify(item.value)}
              data-label={item.label}
              data-istitle={item.isTitle}
              data-disabled={!!item.isTitle || item.disabled}
              onClick={!item.isTitle ? (e) => handleSelect(e) : () => false}
            >
              {item.label}
            </OptionItem>
          </>
        ))}
      </OptionGroup>
      <DropDownIcon />
    </Container>
  )
}

export default OctaSelect