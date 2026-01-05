import { InfoIcon } from '@chakra-ui/icons'
import {
  HStack,
  Link,
  PlacementWithLogical,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverBodyProps,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { isDefined } from '@udecode/plate-core'
import { ReactElement } from 'react'

interface OctaTooltipProps extends PopoverProps {
  contentText: string
  duration?: number
  hrefUrl?: string
  contentLink?: string
  popoverColor?: string
  textColor?: string
  tooltipPlacement?: PlacementWithLogical
  element?: ReactElement
  contentWithElements?: ReactElement
  popoverBody?: PopoverBodyProps
}

const OctaTooltip = ({
  contentText,
  duration,
  hrefUrl,
  contentLink,
  popoverColor = '#ffffff',
  textColor = '#000000',
  tooltipPlacement = 'bottom',
  element,
  contentWithElements,
  popoverBody,
  ...props
}: OctaTooltipProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleMouseEnter = () => {
    onOpen()
    if (duration) setTimeout(() => onClose(), duration)
  }

  const handleMouseLeave = () => {
    onClose()
  }

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement={tooltipPlacement}
      {...props}
    >
      {isDefined(element) && (
        <PopoverTrigger>
          <span onMouseEnter={() => handleMouseEnter()}>{element}</span>
        </PopoverTrigger>
      )}
      {!isDefined(element) && (
        <PopoverTrigger>
          <InfoIcon
            color={'gray.300'}
            onMouseEnter={() => handleMouseEnter()}
          />
        </PopoverTrigger>
      )}
      <PopoverContent color={textColor} bg={popoverColor} width="100%">
        <PopoverArrow bg={popoverColor} />
        <PopoverBody
          onMouseLeave={() => handleMouseLeave()}
          onMouseEnter={onOpen}
          {...popoverBody}
        >
          {contentWithElements ? (
            contentWithElements
          ) : (
            <HStack>
              <Text>{contentText}</Text>
              <Link
                href={hrefUrl}
                isExternal
                style={{ textDecoration: 'underline' }}
              >
                {contentLink}
              </Link>
            </HStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default OctaTooltip
