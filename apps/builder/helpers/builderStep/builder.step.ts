import { WritableDraft } from 'immer/dist/types/types-external';
import { Block, DraggableStep, DraggableStepType, InputStepType, OctaStepType, Step, StepIndices, Typebot } from "models";
import { parseNewStep } from 'services/typebots/typebots'
import { templateTextBot } from './dictionary/input-text.step';
import { templateDateBot } from './dictionary/input-date.step';
import { BuilderStepType } from "./types.builder";
import { templateOfficeHours } from './dictionary/input-officeHours.step';

export const BuildSteps = (
  stepIndices: StepIndices
  ): BuilderStepType => {

    const builder = (type: DraggableStepType, bot: WritableDraft<Typebot>, blockId: string) => {
      let step: Array<DraggableStep>;
      switch (type) {
        case InputStepType.TEXT: {
          step = templateTextBot(bot, blockId, 'Pergunte qualquer coisa')
          break;
        }
        case InputStepType.NUMBER: {
          step = templateTextBot(bot, blockId, 'Pode me informar o número do seu pedido, por favor?')
          break;
        }
        case InputStepType.EMAIL:
          step = templateTextBot(bot, blockId, 'Por favor, digite seu email')
          break;
        case InputStepType.CPF:
          step = templateTextBot(bot, blockId, 'Por favor, digite seu CPF')
          break;
        case InputStepType.DATE: {
          step = templateDateBot(bot, blockId, 'Informe uma data, por favor')
          break;
        }
        case InputStepType.PHONE: 
          step = templateTextBot(bot, blockId, 'Posso anotar seu telefone, por favor?')
          break;
        case OctaStepType.OFFICE_HOURS:
          step = templateOfficeHours(bot, blockId)
          break;
        default:
          step = [parseNewStep(type, blockId)]
          break;
      }
      return step;
    }

    const apply = (type: DraggableStepType, bot: WritableDraft<Typebot>, blockId: string): void => {
      const block: Array<WritableDraft<Block>> = bot.blocks
      const steps = builder(type, bot, blockId);
      steps.map(step => (
        block[stepIndices.blockIndex].steps.splice( stepIndices.stepIndex ?? 0, 0, step)
      ));
    }

    return { apply }
  }
