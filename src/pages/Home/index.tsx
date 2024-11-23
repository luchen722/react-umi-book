import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';
import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { useNavigate, Link, useModel } from '@umijs/max'
import JSZip from 'jszip';
import dayjs from 'dayjs';
import { bookItem } from '@/types'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  
  const {bookList, setBookList} = useModel('book')

  async function parseEpub(data: ArrayBuffer): Promise<bookItem> {
      const zip = new JSZip();
      await zip.loadAsync(data);
      
      // 解析 OPF 文件
      let opfFilePath = Object.keys(zip.files).find((filename) => filename.endsWith('content.opf'));

      if (!opfFilePath) throw new Error('content.opf not found');
      const opfFile = zip.file(opfFilePath);
      console.log(opfFile);
      if (!opfFile) throw new Error('content.opf not found');
      const opfXml = await opfFile.async('string');
      const parser = new DOMParser();
      const opfObj = await parser.parseFromString(opfXml, 'text/xml');
      var namespaces = {"dc": "http://purl.org/dc/elements/1.1/"};
      let bookTitle: string = '';
      let authorNames: string = '';
      let date: string = '';
      // 从 OPF 文件中提取元数据
      if (opfObj) {
        const metadata = opfObj.querySelector('package > metadata');
        // 标题
        bookTitle = metadata?.getElementsByTagNameNS(namespaces['dc'], 'title')[0]?.textContent || '';
        const authors = (metadata?.getElementsByTagNameNS(namespaces['dc'], 'creator') || []) as any[];
        // 作者
        authorNames = Array.from(authors).map((author: HTMLElement) => author.textContent).join(', ');
        // 日期
        date = metadata?.getElementsByTagNameNS(namespaces['dc'], 'date')[0]?.textContent || '';
      }
      // 你可以继续解析其他文件，如 NCX 或内容文件
      // ...
      return { folder: zip, title: bookTitle, author: authorNames, date };
  }

  const props: UploadProps = {
    beforeUpload: (file) => {
      const fileRender = new FileReader();
      fileRender.onload = async function () {
        const base64 = fileRender.result;
        if (base64) {
          const boox = await parseEpub(base64 as ArrayBuffer) as bookItem;
          
          if (!bookList.find(b => b.title === boox.title)) {
            setBookList(prev => [...prev, boox]);
          }
        }
      }
      fileRender.readAsArrayBuffer(file);
      return false;
    },
    fileList: []
  };

  return (
    <PageContainer ghost>
      <div className={styles.container}>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>选择小说(EPUB)</Button>
        </Upload>
        <div className={styles.bookList}>
          {
            bookList.map((book, index) => {
              return <Link key={index} to={`/book`} state={{title: book.title}}>
                <div className={styles.bookItem}>
                  <div className={styles.title}>书名：{book.title}</div>
                  <div className={styles.author}>作者：{book.author}</div>
                  <div className={styles.date}>发布日期：{dayjs(book.date).format('YYYY-MM-DD')}</div>
                </div>
              </Link>
            })
          }
        </div>
      </div>
    </PageContainer>
  );
};

export default HomePage;
