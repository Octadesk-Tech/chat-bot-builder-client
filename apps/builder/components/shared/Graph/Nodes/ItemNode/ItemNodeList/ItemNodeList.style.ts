import styled from 'styled-components';

export const Container = styled.div`
  padding: 10px 15px;
  background-color: #F4F4F5;
  margin-bottom: 5px;
  border: 1px solid #E3E4E8;
  font-family: 'Noto Sans', sans-serif;
  font-size: .9rem;
`;

export const ChatReturnContainer = styled(Container)`
  padding: 8px 0px 18px;
  margin-bottom: 14px;
  border: none;
  border-bottom: 1px solid #DADBDF;
  color: #5A6377;
`;

export const HandleSelectCalendar = styled.div`
  font-family: 'Noto Sans', sans-serif;
  font-size: 16px;
  cursor: pointer;
`

export const SelectedCalendar = styled.span`
  padding: 3px 8px;
  background-color: rgb(19,102,201);
  color: #fff;
  border-radius: 5px;
`;
