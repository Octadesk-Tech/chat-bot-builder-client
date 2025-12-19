import { StackProps, HStack, Stack } from '@chakra-ui/react'
import { StartStep, Step, StepIndices, WOZStepType } from 'models'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { StepNodeContent } from './StepNodeContent/StepNodeContent/StepNodeContent'
import { StepTypeLabel } from 'components/editor/StepsSideBar/StepTypeLabel'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { BlockStack } from './StepNode/StepNode.style'

export const StepNodeOverlay = ({
  step,
  indices,
  ...props
}: { step: Step | StartStep; indices: StepIndices } & StackProps) => {
  const shouldApplyGradientBorder = [
    WOZStepType.MESSAGE,
    WOZStepType.INTERPRET_DATA_WITH_AI,
  ].includes(step.type as WOZStepType)

  return (
    <BlockStack isOpened={true} isPreviewing={false}>
      <Stack
        borderWidth="1px"
        rounded="lg"
        bgColor="#F4F4F5"
        cursor={'grab'}
        w="300px"
        pointerEvents="none"
        shadow="lg"
        padding={'10px'}
        className={shouldApplyGradientBorder ? 'gradient-border-woz' : ''}
        {...props}
      >
        <HStack fontSize={'14px'}>
          <StepIcon type={step.type} />
          <StepTypeLabel type={step.type} />
        </HStack>
        {step.type !== 'start' && (
          <span>
            <OctaDivider />
            <StepNodeContent step={step} indices={indices} />
          </span>
        )}
      </Stack>
    </BlockStack>
  )
}
