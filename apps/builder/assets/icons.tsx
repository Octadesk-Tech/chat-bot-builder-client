import { IconProps, Icon } from '@chakra-ui/react'
import * as MaterialDesign from 'react-icons/md'
import { IconContext } from 'react-icons'

const featherIconsBaseProps: IconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2px',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 99% of these icons are from Feather icons (https://feathericons.com/)

export const SettingsIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </Icon>
)

export const LogOutIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </Icon>
)

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </Icon>
)

export const PlusIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </Icon>
)

export const FolderIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </Icon>
)

export const MoreVerticalIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </Icon>
)

export const GlobeIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </Icon>
)

export const ToolIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </Icon>
)

export const FolderPlusIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    <line x1="12" y1="11" x2="12" y2="17"></line>
    <line x1="9" y1="14" x2="15" y2="14"></line>
  </Icon>
)

export const TextIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineChatBubble />
    </div>
  </IconContext.Provider>
)

export const WandIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdAutoFixHigh />
    </div>
  </IconContext.Provider>
)

export const AskNameIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineBadge />
    </div>
  </IconContext.Provider>
)

export const ImageIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdOutlineImage />
    </div>
  </IconContext.Provider>
)

export const CheckCircleOutlineIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdCheckCircleOutline />
    </div>
  </IconContext.Provider>
)

export const BlockIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdBlock />
    </div>
  </IconContext.Provider>
)

export const UploadFileIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdUploadFile />
    </div>
  </IconContext.Provider>
)

export const CalendarIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdCalendarMonth />
    </div>
  </IconContext.Provider>
)

export const FlagIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  </Icon>
)

export const BoldIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdFormatBold />
    </div>
  </IconContext.Provider>
)

export const ItalicIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdFormatItalic />
    </div>
  </IconContext.Provider>
)

export const UnderlineIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdFormatUnderlined />
    </div>
  </IconContext.Provider>
)

export const StrikethroughIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdFormatStrikethrough />
    </div>
  </IconContext.Provider>
)

export const LinkIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdLink />
    </div>
  </IconContext.Provider>
)

export const EmojiIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdInsertEmoticon />
    </div>
  </IconContext.Provider>
)

export const SaveIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </Icon>
)

export const CheckIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </Icon>
)

export const ChatIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineTextFields />
    </div>
  </IconContext.Provider>
)

export const TrashIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </Icon>
)

export const PlayIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </Icon>
)

export const LayoutIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdInsertDriveFile />
    </div>
  </IconContext.Provider>
)

export const CodeIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </Icon>
)

export const PencilIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </Icon>
)

export const EditIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </Icon>
)

export const UploadIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="16 16 12 12 8 16"></polyline>
    <line x1="12" y1="12" x2="12" y2="21"></line>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
    <polyline points="16 16 12 12 8 16"></polyline>
  </Icon>
)

export const DownloadIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </Icon>
)

export const NumberIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineReceipt />
    </div>
  </IconContext.Provider>
)

export const EmailIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdEmail />
    </div>
  </IconContext.Provider>
)

export const ContactCardIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlinePermIdentity />
    </div>
  </IconContext.Provider>
)

export const PhoneIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdPhone />
    </div>
  </IconContext.Provider>
)

export const CheckSquareIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdCheckBox />
    </div>
  </IconContext.Provider>
)

export const WavingHandIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdWavingHand />
    </div>
  </IconContext.Provider>
)

export const AssignToIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdSwapHoriz />
    </div>
  </IconContext.Provider>
)

export const PreReserveIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdLock />
    </div>
  </IconContext.Provider>
)

export const ConversationTagIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdSell />
    </div>
  </IconContext.Provider>
)

export const AlarmIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdAlarm />
    </div>
  </IconContext.Provider>
)

export const ListIcon = (props: any) => (
  <IconContext.Provider
    value={{
      color: props.color,
      className: 'global-class-name',
      size: props.fontSize,
    }}
  >
    <div>
      <MaterialDesign.MdFormatListBulleted />
    </div>
  </IconContext.Provider>
)

export const RadioIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdRadioButtonChecked />
    </div>
  </IconContext.Provider>
)

export const FilterIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdFilterAlt />
    </div>
  </IconContext.Provider>
)

export const UserIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </Icon>
)

export const ExpandIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <polyline points="15 3 21 3 21 9"></polyline>
    <polyline points="9 21 3 21 3 15"></polyline>
    <line x1="21" y1="3" x2="14" y2="10"></line>
    <line x1="3" y1="21" x2="10" y2="14"></line>
  </Icon>
)

export const ExternalLinkIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </Icon>
)

export const FilmIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdVideoLibrary />
    </div>
  </IconContext.Provider>
)

export const GripIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <circle cx="12" cy="9" r="1"></circle>
    <circle cx="19" cy="9" r="1"></circle>
    <circle cx="5" cy="9" r="1"></circle>
    <circle cx="12" cy="15" r="1"></circle>
    <circle cx="19" cy="15" r="1"></circle>
    <circle cx="5" cy="15" r="1"></circle>
  </Icon>
)

export const LockedIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </Icon>
)

export const UnlockedIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </Icon>
)

export const UndoIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M3 7v6h6"></path>
    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
  </Icon>
)

export const RedoIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M21 7v6h-6"></path>
    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
  </Icon>
)

export const FileIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </Icon>
)

export const EyeIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdVisibility />
    </div>
  </IconContext.Provider>
)

export const SendEmailIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </Icon>
)

export const GithubIcon = (props: IconProps) => (
  <Icon viewBox="0 0 512 512" {...props}>
    <title>{'Logo Github'}</title>
    <path d="M256 32C132.3 32 32 134.9 32 261.7c0 101.5 64.2 187.5 153.2 217.9a17.56 17.56 0 003.8.4c8.3 0 11.5-6.1 11.5-11.4 0-5.5-.2-19.9-.3-39.1a102.4 102.4 0 01-22.6 2.7c-43.1 0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1 1.4-14.1h.1c22.5 2 34.3 23.8 34.3 23.8 11.2 19.6 26.2 25.1 39.6 25.1a63 63 0 0025.6-6c2-14.8 7.8-24.9 14.2-30.7-49.7-5.8-102-25.5-102-113.5 0-25.1 8.7-45.6 23-61.6-2.3-5.8-10-29.2 2.2-60.8a18.64 18.64 0 015-.5c8.1 0 26.4 3.1 56.6 24.1a208.21 208.21 0 01112.2 0c30.2-21 48.5-24.1 56.6-24.1a18.64 18.64 0 015 .5c12.2 31.6 4.5 55 2.2 60.8 14.3 16.1 23 36.6 23 61.6 0 88.2-52.4 107.6-102.3 113.3 8 7.1 15.2 21.1 15.2 42.5 0 30.7-.3 55.5-.3 63 0 5.4 3.1 11.5 11.4 11.5a19.35 19.35 0 004-.4C415.9 449.2 480 363.1 480 261.7 480 134.9 379.7 32 256 32z" />
  </Icon>
)

export const UsersIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </Icon>
)

export const AlignLeftTextIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <line x1="17" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="17" y1="18" x2="3" y2="18"></line>
  </Icon>
)

export const BoxIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </Icon>
)

export const HelpCircleIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </Icon>
)

export const CopyIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </Icon>
)

export const TemplateIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </Icon>
)

export const MinusIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </Icon>
)

export const LaptopIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path
      d="M3.2 14.2222V4C3.2 2.89543 4.09543 2 5.2 2H18.8C19.9046 2 20.8 2.89543 20.8 4V14.2222M3.2 14.2222H20.8M3.2 14.2222L1.71969 19.4556C1.35863 20.7321 2.31762 22 3.64418 22H20.3558C21.6824 22 22.6414 20.7321 22.2803 19.4556L20.8 14.2222"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M11 19L13 19"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
)

export const MouseIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <path
      d="M12 2V2C16.4183 2 20 5.58172 20 10V14C20 18.4183 16.4183 22 12 22V22C7.58172 22 4 18.4183 4 14V10C4 5.58172 7.58172 2 12 2V2ZM12 2V9"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Icon>
)

export const HardDriveIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <line x1="22" y1="12" x2="2" y2="12"></line>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
    <line x1="6" y1="16" x2="6.01" y2="16"></line>
    <line x1="10" y1="16" x2="10.01" y2="16"></line>
  </Icon>
)

export const CreditCardIcon = (props: IconProps) => (
  <Icon viewBox="0 0 24 24" {...featherIconsBaseProps} {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  </Icon>
)

export const InformationIcon = (props: IconProps) => (
  <Icon viewBox="0 0 16 16" {...featherIconsBaseProps} {...props}>
    <path
      d="M8.00004 1.3335C4.32004 1.3335 1.33337 4.32016 1.33337 8.00016C1.33337 11.6802 4.32004 14.6668 8.00004 14.6668C11.68 14.6668 14.6667 11.6802 14.6667 8.00016C14.6667 4.32016 11.68 1.3335 8.00004 1.3335ZM8.00004 11.3335C7.63337 11.3335 7.33337 11.0335 7.33337 10.6668V8.00016C7.33337 7.6335 7.63337 7.3335 8.00004 7.3335C8.36671 7.3335 8.66671 7.6335 8.66671 8.00016V10.6668C8.66671 11.0335 8.36671 11.3335 8.00004 11.3335ZM8.66671 6.00016H7.33337V4.66683H8.66671V6.00016Z"
      fill="#C4C7CF"
      stroke="none"
    />
  </Icon>
)

export const OutlineInformationIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineInfo />
    </div>
  </IconContext.Provider>
)

export const QuestionIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdHelp />
    </div>
  </IconContext.Provider>
)

export const CallBotIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdOutlineRouter />
    </div>
  </IconContext.Provider>
)

export const CommerceIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdStore />
    </div>
  </IconContext.Provider>
)

export const WebhookIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdHttp />
    </div>
  </IconContext.Provider>
)
export const ExternalEventIcon = (props: any) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.4 10.8H11.104C11.32 10.552 11.64 10.4 12 10.4C12.664 10.4 13.2 10.936 13.2 11.6C13.2 12.264 12.664 12.8 12 12.8C11.648 12.8 11.328 12.648 11.104 12.4H7.92C7.552 14.224 5.936 15.6 4 15.6C1.792 15.6 0 13.808 0 11.6C0 9.66399 1.376 8.04799 3.2 7.67999V9.33599C2.272 9.66399 1.6 10.56 1.6 11.6C1.6 12.92 2.68 14 4 14C5.32 14 6.4 12.92 6.4 11.6V10.8ZM8.4 1.99999C9.72 1.99999 10.8 3.07999 10.8 4.39999H12.4C12.4 2.19199 10.608 0.399994 8.4 0.399994C6.192 0.399994 4.4 2.19199 4.4 4.39999C4.4 5.54399 4.88 6.56799 5.64 7.29599L3.76 10.416C3.216 10.528 2.8 11.016 2.8 11.6C2.8 12.264 3.336 12.8 4 12.8C4.664 12.8 5.2 12.264 5.2 11.6C5.2 11.472 5.184 11.352 5.144 11.24L7.848 6.73599C6.792 6.48799 6 5.53599 6 4.39999C6 3.07999 7.08 1.99999 8.4 1.99999ZM12 9.19999C11.488 9.19999 11.016 9.35999 10.624 9.63199L8.184 5.57599C7.624 5.47999 7.2 4.99199 7.2 4.39999C7.2 3.73599 7.736 3.19999 8.4 3.19999C9.064 3.19999 9.6 3.73599 9.6 4.39999C9.6 4.51999 9.584 4.63199 9.552 4.74399L11.304 7.66399C11.528 7.62399 11.76 7.59999 12 7.59999C14.208 7.59999 16 9.39199 16 11.6C16 13.808 14.208 15.6 12 15.6C10.52 15.6 9.224 14.792 8.536 13.6H10.672C11.056 13.856 11.512 14 12 14C13.32 14 14.4 12.92 14.4 11.6C14.4 10.28 13.32 9.19999 12 9.19999Z" fill="black" />
  </svg>

)

export const WarningIcon = (props: any) => (
  <IconContext.Provider
    value={{ color: props.color, className: 'global-class-name' }}
  >
    <div>
      <MaterialDesign.MdWarning />
    </div>
  </IconContext.Provider>
)

export const ErrorIcon = (props: any) => (
  <IconContext.Provider
    value={{ ...props, color: props.color, className: 'global-class-name' }}
  >
    <MaterialDesign.MdError />
  </IconContext.Provider>
)

export const ReturnArrow = ({ color, ...props }: any) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 9.125C12 10.4179 11.4864 11.6579 10.5721 12.5721C9.65791 13.4864 8.41793 14 7.125 14H1.5V12.5H7.125C9 12.5 10.5 11 10.5 9.125C10.5 7.25 9 5.75 7.125 5.75H2.8725L5.1825 8.0675L4.125 9.125L0 5L4.125 0.875L5.19 1.9325L2.8725 4.25H7.125C8.41793 4.25 9.65791 4.76361 10.5721 5.67785C11.4864 6.59209 12 7.83207 12 9.125Z"
      fill={color}
    />
  </svg>
)
