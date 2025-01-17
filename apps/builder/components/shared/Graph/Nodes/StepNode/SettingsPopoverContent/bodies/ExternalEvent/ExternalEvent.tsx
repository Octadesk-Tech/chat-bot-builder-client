import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Flex, FormLabel, Icon, Input, InputGroup, InputRightElement, Select, Stack, Text, useToast } from "@chakra-ui/react";
import { CodeEditor } from "components/shared/CodeEditor";
import { TableList, TableListItemProps } from "components/shared/TableList";
import { useTypebot } from "contexts/TypebotContext";
import { useSocket } from "hooks/useSocket";
import { ExternalEventOptions, ExternalEventStep, ResponseVariableMapping, TextBubbleContent } from "models";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdCheckCircle, MdContentCopy, MdInfo } from "react-icons/md";
import { mountUrl } from "services/externalEvent";
import { getDeepKeys } from "services/integrations";
import { TextBubbleEditor } from "../../../TextBubbleEditor";
import { AssignToResponsibleSelect } from "../AssignToTeam/AssignToResponsibleSelect";
import { DataVariableInputs } from "../WebhookSettings/ResponseMappingInputs";

type IProps = {
  step: ExternalEventStep,
  onOptionsChange: (options: ExternalEventOptions) => void
}

export const ExternalEvent = React.memo(function ExternalEvent({
  step,
  onOptionsChange
}: IProps) {
  const [requestResponse, setRequestResponse] = useState<string>();
  const [request, setRequest] = useState<"receive" | "define">();
  const [responseKeys, setResponseKeys] = useState<string[]>([])
  const [successTest, setSuccessTest] = useState<boolean>();
  const [invalidData, setInvalidData] = useState<boolean>();
  const [timeout, setTimeout] = useState<string>("5")
  const [url, setUrl] = useState<string>("")
  const { typebot } = useTypebot()
  const { data } = useSocket(`${typebot?.id}`, `${step.blockId}`)

  const color = "#1366C9";
  const MAX_LENGHT_TEXT = 500;

  const errorToast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const successToast = useToast({
    position: 'top-right',
    status: 'success',
  })

  const handleResponseMappingChange = (
    responseVariableMapping: ResponseVariableMapping[]
  ) => {
    onOptionsChange({ ...step.options, responseVariableMapping })
  }

  const ResponseMappingInputs = useMemo(
    () => (props: TableListItemProps<ResponseVariableMapping>) =>
      <DataVariableInputs {...props} dataItems={responseKeys} />,
    [responseKeys]
  )

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      successToast({ title: 'Copiado com sucesso!' })
    });
  };

  const getUrl = useCallback(async () => {
    if (!typebot?.id) return;

    const url = await mountUrl({ blockId: step.blockId, botId: typebot.id });
    setUrl(url)
  }, [])


  // const makeRequest = (async () => {
  //   try {
  //     // const { data } = await axios.get(`${url}`);
  //     // const json = JSON.stringify(data, undefined, 2);

  //     // if (!validationJson(json)) return;
  //     // setRequestResponse(json);

  //     step.options.body = JSON.stringify(json);

  //     setRequest("receive");
  //     setResponseKeys(getDeepKeys(data))

  //     setSuccessTest(true);
  //     successToast({ title: 'Sucesso ao fazer requisição' })
  //   } catch (err: any) {
  //     errorToast({ title: 'Erro ao fazer requisição' })
  //     setSuccessTest(false);
  //   }
  // })

  const validationJson = (value: string) => {
    try {
      const json = JSON.parse(value);

      setInvalidData(false);
      setResponseKeys(getDeepKeys(json))

      step.options.body = JSON.stringify(json);

      return true;
    } catch (err: any) {
      setInvalidData(true);
      return false;
    }
  }

  const onSelect = (e: any) => {
    const value = e.target.value;
    setTimeout(value);
    step.options.timeout = value;
  }

  const fallbackMessageComponent = (
    message: TextBubbleContent,
    index: number
  ) => {
    return (
      <Box>
        <FormLabel mb="0" htmlFor="placeholder">
          Mensagem para resposta inválida - Tentativa {index + 1}
        </FormLabel>
        <TextBubbleEditor
          required={{
            errorMsg: `O campo "Mensagem para resposta inválida - Tentativa ${index + 1
              }" é obrigatório`,
          }}
          onClose={(content) => handleFallbackMessage(content, index)}
          initialValue={message ? message.richText : []}
          onKeyUp={(content) => handleFallbackMessage(content, index)}
          maxLength={MAX_LENGHT_TEXT}
        />
      </Box>
    )
  }

  const handleFallbackMessage = (content: TextBubbleContent, index: number) => {
    if (!step.options) return
    if (!step.options?.fallbackMessages) step.options.fallbackMessages = []

    if (step.options.fallbackMessages.length > index)
      step.options.fallbackMessages[index] = content
    else step.options.fallbackMessages.push(content)

    onOptionsChange({
      ...step.options,
    })
  }

  const onAssign = (v: any) => {
    onOptionsChange({
      ...step.options,
      ...v,
    })
  }

  useEffect(() => {
    if (!step.options) step.options = {} as ExternalEventOptions;
    step.options.responseVariableMapping = [];
  }, [request])

  useEffect(() => {
    if (!data) return;
    console.log(data);
    // step.options.body = JSON.stringify(data.json);
    // setRequest("receive");
    // setResponseKeys(getDeepKeys(data))
    // setSuccessTest(true);
    // successToast({ title: 'Sucesso ao fazer requisição' })
  }, [data])

  useEffect(() => {
    getUrl();
  }, [])

  return (
    <>
      {!request &&
        <Stack w="100" gap="2">
          <Flex w="100" direction="column" gap="1" >
            <Text
              color="black"
              fontFamily="Poppins"
              fontSize="14px"
              fontStyle="normal"
              fontWeight="600"
              lineHeight="24px"
            >
              URL de retorno
            </Text>

            <InputGroup flex="1">
              <Input value={url} bg="#f4f4f5" />
              <InputRightElement>
                <Box
                  as="button"
                  onClick={handleCopy}
                  cursor="pointer"
                >
                  <MdContentCopy />
                </Box>
              </InputRightElement>
            </InputGroup>

            <Text
              color="black"
              fontFamily="Poppins"
              fontSize="12px"
              fontStyle="normal"
              lineHeight="24px"
              fontWeight="300"
            >
              Essa URL é um endereço personalizado que irá enviar dados ao nosso sistema.
            </Text>
          </Flex>

          <Flex justifyContent="center" alignItems="center" gap="16px" bg="#ecf4fd" borderWidth="1px" borderColor="#5699ea" borderRadius="md" padding="26px">
            <Icon fontSize="2xl" color="#2F4C74">
              <MdInfo />
            </Icon>

            <Text color="#2F4C74" fontFamily="Poppins" fontSize="14px" fontStyle="normal" lineHeight="24px">
              A última informação da URL de retorno deverá ser o ID específico da conversa do cliente.
              Exemplo: https.://[...]/id-conversa
            </Text>
          </Flex>

          <Button
            bg={color}
            color="white"
            // onClick={makeRequest}
            w="100%"
          >
            Receber Requisição
          </Button>

          <Button
            variant="outline"
            borderColor={color}
            color={color}
            onClick={() => setRequest("define")}
            w="100%"
          >
            Definir Requisição
          </Button>
        </Stack>
      }

      {request &&
        <>
          {request === "receive" &&
            <Flex
              w='100'
              justifyContent='start'
              alignItems='center'
              padding='16px'
              borderRadius='12px'
              gap='12px'
              bg={successTest ? '#09a944' : '#cd3838'}
              marginBottom='16px'
              color='white'
            >
              <Icon fontSize="2xl" color="white">
                <MdCheckCircle />
              </Icon>
              <Text>
                {successTest ? 'A requisição foi bem sucedida'
                  : `Erro: - Não foi possível executar esta chamada externa.`}
              </Text>
            </Flex>
          }

          {request === "define" &&
            <Flex
              bg="white"
              color={color}
              borderColor={color}
              borderWidth="3px"
              borderRadius="12px"
              padding="12px"
              marginBottom="12px"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontFamily="Poppins" fontSize="16px" fontWeight="semibold" lineHeight="24px"> Definir Requisição </Text>
            </Flex>
          }

          <CodeEditor
            value={requestResponse ?? ''}
            defaultValue={'{}'}
            lang="json"
            isReadOnly={(request == "define") ? false : true}
            withVariableButton={false}
            debounceTimeout={1000}
            onChange={(newValue) => validationJson(newValue)}
          />

          {invalidData === true &&
            <Text color="#cd3838" fontFamily="Poppins" fontSize="14px" fontWeight="bold" fontStyle="normal" lineHeight="24px">
              Digite um JSON válido!
            </Text>
          }

          {invalidData === false &&
            <Stack marginTop="10px">
              <Accordion allowToggle allowMultiple>
                <AccordionItem>
                  <AccordionButton justifyContent="space-between">
                    Salvar variáveis
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} as={Stack} spacing="6">
                    <TableList<ResponseVariableMapping>
                      initialItems={step.options?.responseVariableMapping as any || []}
                      onItemsChange={handleResponseMappingChange}
                      Item={ResponseMappingInputs}
                      addLabel="Adicionar variável"
                      debounceTimeout={0}
                    />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Stack>
          }

          <Stack marginTop="10px">
            <Accordion allowToggle allowMultiple>
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  Tempo de espera da requisição
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} as={Stack} spacing="6">
                  <Flex justifyContent="start" alignItems="center" gap="6px">
                    <Select
                      width="80px"
                      value={timeout}
                      onChange={onSelect}
                    >
                      {Array.from({ length: 26 }, (_, index) => {
                        const i = index + 5;
                        return (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        );
                      })}
                    </Select>
                    <Text fontFamily="Poppins" fontSize="16px" fontWeight="normal" fontStyle="normal" lineHeight="24px">Minutos</Text>
                  </Flex>
                  <Text fontFamily="Poppins" fontSize="14px" fontWeight="normal" fontStyle="normal" lineHeight="24px">Minutos que aguardará para ter um retorno</Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Stack>

          {step.options?.useFallback &&
            (step.options?.fallbackMessages?.length ? (
              <Stack marginTop="10px">
                <Accordion allowToggle allowMultiple>
                  <AccordionItem>
                    <AccordionButton justifyContent="space-between">
                      Se o cliente não responder com nenhuma das opções:
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} as={Stack} spacing="6">
                      <Flex direction={'column'} gap={4}>
                        {step.options?.fallbackMessages.map((message, index) =>
                          fallbackMessageComponent(message, index)
                        )}
                        <Box>
                          <FormLabel mb="0" htmlFor="placeholder">
                            Se o cliente errar 3 vezes seguidas, atribuir conversa para:
                          </FormLabel>
                          <AssignToResponsibleSelect
                            hasResponsibleContact={false}
                            options={step.options}
                            onSelect={onAssign}
                          />
                        </Box>
                      </Flex>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Stack>
            ) : (
              <TextBubbleEditor
                onClose={(content) => handleFallbackMessage(content, 0)}
                initialValue={[]}
                onKeyUp={(content) => handleFallbackMessage(content, 0)}
              />
            ))}
        </>
      }
    </>
  )
})
