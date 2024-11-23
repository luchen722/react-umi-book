import { useState } from 'react';
import { bookItem } from '@/types'


const useBookList = (): {
  bookList: bookItem[], 
  setBookList: React.Dispatch<React.SetStateAction<bookItem[]>>,
}=> {
  const [bookList, setBookList] = useState<bookItem[]>([]);
  
  return {
    bookList,
    setBookList
  };
};

export default useBookList;
