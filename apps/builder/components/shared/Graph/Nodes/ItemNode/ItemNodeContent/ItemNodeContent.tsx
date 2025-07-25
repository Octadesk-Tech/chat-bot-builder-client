import { Item, ItemIndices, ItemType, Step } from 'models'
import { ButtonNodeContent } from './contents/ButtonNodeContent'
import { ConditionNodeContent } from './contents/ConditionNodeContent'
import { ExternalEventNodeContent } from './contents/ExternalEventNodeContent'
import { OfficeHoursNodeContent } from './contents/OfficeHoursNodeContent'
import { WebhookNodeContent } from './contents/WebhooksNodeContent'
import { WhatsAppButtonsNodeContent } from './contents/WhatsAppButtonsContent'
import { WhatsAppOptionsNodeContent } from './contents/WhatsAppOptionsContent'
import { ChatReturnContent } from './contents/ChatReturnContent'

type Props = {
  step?: Step
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const ItemNodeContent = ({ item, indices, isMouseOver, step }: Props) => {

  switch (item.type) {
    case ItemType.BUTTON:
      return (
        <ButtonNodeContent
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case ItemType.CONDITION:
      return <ConditionNodeContent item={item} />
    case ItemType.OFFICE_HOURS:
      return <OfficeHoursNodeContent item={item} />
    case ItemType.WEBHOOK:
      return <WebhookNodeContent item={item} />
    case ItemType.EXTERNAL_EVENT:
      return <ExternalEventNodeContent item={item} />
    case ItemType.WHATSAPP_OPTIONS_LIST:
      return (
        <WhatsAppOptionsNodeContent
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
    case ItemType.WHATSAPP_BUTTONS_LIST:
      return (
        <WhatsAppButtonsNodeContent
          item={item}
          isMouseOver={isMouseOver}
          indices={indices}
        />
      )
      case ItemType.CHAT_RETURN:
        return <ChatReturnContent item={item} />
    default:
      return <></>
  }
}
