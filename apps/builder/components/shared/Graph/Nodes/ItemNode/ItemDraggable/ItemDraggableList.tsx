import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, HStack, IconButton, Stack, Flex, Icon } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';
import { Item, ItemIndices, StepWithItems, Step, ChoiceInputStep } from 'models';
import { useTypebot } from 'contexts/TypebotContext';
import { ItemNodeContent } from '../ItemNodeContent';
import { SourceEndpoint } from '../../../Endpoints/SourceEndpoint';
import { MdClose } from 'react-icons/md';

interface SortableItemProps {
  item: Item;
  indices: ItemIndices;
  step?: StepWithItems;
  isReadOnly: boolean;
  showControlButtons: boolean;
  onRemoveItem: () => void;
  onUpdateItem: (value: string) => void;
}

const SortableItem = ({ item, indices, step, isReadOnly, showControlButtons, onRemoveItem, onUpdateItem }: SortableItemProps) => {
  const { typebot } = useTypebot();
  
  const isConnectable = !(
    typebot?.blocks[indices.blockIndex].steps[
      indices.stepIndex
    ] as ChoiceInputStep
  )?.options?.isMultipleChoice;
  const showConnection = typebot && isConnectable && isReadOnly;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const optionStyle = isReadOnly ? {} : {
    borderWidth: "1px",
    borderColor: "gray.200",
    borderRadius: "md",
    bg: "gray.100",
    p: 4,
  }

  const handleRemoveItemClick = () => {
    onRemoveItem();
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      w="100%"
      bg="white"
    >
      <HStack spacing={2} align="flex-start" alignItems="center">
        {showControlButtons && (
          <IconButton
            aria-label="Arrastar item"
            icon={<DragHandleIcon boxSize={3} />}
            variant="ghost"
            colorScheme="gray"
            color="gray.500"
            cursor="grab"
            _active={{ cursor: 'grabbing' }}
            size="sm"
            {...attributes}
            {...listeners}
          />
        )}

        <Flex flex={1}
          {...optionStyle}
          w="full"
        >
          <Flex
            align="center"
            rounded="md"
            bgColor="white"
            borderWidth="1px"
            borderColor="gray.400"
            w="full"
            pos="relative"
          >
            <ItemNodeContent
              item={item}
              indices={indices}
              step={step as Step}
              onUpdateItem={onUpdateItem}
            />
            {showConnection && (
              <SourceEndpoint
                source={{
                  blockId: typebot.blocks[indices.blockIndex].id,
                  stepId: item.stepId,
                  itemId: item.id,
                }}
                pos="absolute"
                right="-44px"
                pointerEvents="all"
              />
            )}
          </Flex>
        </Flex>

        {showControlButtons && (
          <IconButton
            aria-label="Deletar item"
            icon={<Icon as={MdClose} boxSize={5} />}
            variant="outline"
            colorScheme="gray"
            color="gray.500"
            size="sm"
            borderWidth="0"
            onClick={handleRemoveItemClick}
          />
        )}
      </HStack>
    </Box>
  );
};

interface ItemDraggableListProps {
  items: Item[];
  step: StepWithItems;
  indices: Omit<ItemIndices, 'itemIndex'>;
  isReadOnly?: boolean;
  hideConnection?: boolean;
  handleUpdateItem?: (item: Item, itemIndex: number, value: string) => void;
  handleRemoveItem?: (item: Item, itemIndex: number) => void;
  handleReorderItem?: (oldIndex: number, newIndex: number) => void;
  renderPlaceholder?: (index: number) => React.ReactNode;
}

export const ItemDraggableList = ({
  items,
  step,
  indices,
  isReadOnly = false,
  handleUpdateItem,
  handleRemoveItem,
  handleReorderItem,
  renderPlaceholder,
}: ItemDraggableListProps) => {
  const { blockIndex, stepIndex } = indices;
  const { reorderItem, deleteItem } = useTypebot();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || isReadOnly) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    
    const oldIndex = items.findIndex((item) => 
      item && item != null && item.id && String(item.id) === activeId
    );
    const newIndex = items.findIndex((item) => 
      item && item != null && item.id && String(item.id) === overId
    );

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      if (handleReorderItem) {
        handleReorderItem(oldIndex, newIndex);
      } else {
        reorderItem({ blockIndex, stepIndex }, oldIndex, newIndex);
      }
    }
  };

  const validItemsWithIndices = items
    .map((item, index) => ({ item, originalIndex: index }))
    .filter(({ item }) => item && item != null && item.id && String(item.id));
  
  const itemIds = validItemsWithIndices.map(({ item }) => String(item.id));

  const showControlButtons = items.length > 1 && !isReadOnly;

  const handleItemRemove = (item: Item, itemIndex: number) => {
    if (handleRemoveItem) {
      handleRemoveItem(item, itemIndex);
    } else {
      deleteItem({
        blockIndex,
        stepIndex,
        itemIndex,
        itemsCount: items.length,
      });
    }
  };

  const handleItemUpdate = (item: Item, itemIndex: number, value: string) => {
    if (handleUpdateItem) {
      handleUpdateItem(item, itemIndex, value);
    }
  };

  return (
    <Box w="100%">
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-expect-error - React types version mismatch between @dnd-kit and @types/react */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1} w="full">
            {validItemsWithIndices.map(({ item, originalIndex }, mapIndex) => (
              <React.Fragment key={item.id}>
                <SortableItem
                  item={item}
                  step={step}
                  indices={{
                    blockIndex,
                    stepIndex,
                    itemIndex: originalIndex,
                    itemsCount: items.length,
                  }}
                  isReadOnly={isReadOnly}
                  showControlButtons={showControlButtons}
                  onRemoveItem={() => handleItemRemove(item, originalIndex)}
                  onUpdateItem={(value) => handleItemUpdate(item, originalIndex, value)}
                />
                {renderPlaceholder && mapIndex < validItemsWithIndices.length - 1 && (
                  <>{renderPlaceholder(originalIndex + 1)}</>
                )}
              </React.Fragment>
            ))}
          </Stack>
        </SortableContext>
      </DndContext>
    </Box>
  );
};

