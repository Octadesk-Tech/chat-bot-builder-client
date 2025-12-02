import { getBaseClient } from '../http'
import { loadParameterHeader } from '../helpers/headers'
import { PersonsServicesInterface } from './types.persons'

const getPersonsClient = () => getBaseClient('personsService')

export const Persons = (): PersonsServicesInterface => {

  const getStatusContact = async (): Promise<Record<string, string>> => {
    const client = await getPersonsClient()
    const res = await client.get('contact-status', loadParameterHeader());
    const data = res.data;

    const ContactStatus = Object.fromEntries(
      data.map((item: any) => [item.name, item.id])
    );

    return ContactStatus;
  };

  return { getStatusContact }
}

export default Persons