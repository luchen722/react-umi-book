import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useModel, useNavigate } from '@umijs/max';
import { useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import { LeftOutlined } from '@ant-design/icons';
import styles from './index.less'
import { Affix, Col, ColorPicker, Input, Row, Select, Space } from 'antd';
const AccessPage: React.FC = () => {
  const bookRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const nav = useNavigate();
  const {bookList} = useModel('book');
  const [menu, setMenu] = useState<any[]>([]);
  const [active, setActive] = useState<string>('');
  const [bookContent, setBookContent] = useState<any>(null);
  const [lineHeight, setLineHeight] = useState<string>('1.5');
  const [fontSize, setFontSize] = useState<string>('16');
  const [colorText, setColorText] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  const getMenu = async (zip?: JSZip): Promise<void> => {
    const list: any[] = [];
    if (zip) {
      let tocFilePath = Object.keys(zip.files).find((filename) => filename.endsWith('toc.ncx'));
      if (tocFilePath) {
        const tocFile = zip.file(tocFilePath);
        if (tocFile) {
          const tocXml = await tocFile.async('string')
          const parser = new DOMParser();
          const tocDom = await parser.parseFromString(tocXml, 'text/xml');
          tocDom.querySelectorAll('navPoint').forEach(async (navPoint) => {
            const label = navPoint.querySelector('navLabel')?.textContent;
            const contentFilePath = navPoint.querySelector('content')?.getAttribute('src');
            if (label && contentFilePath) {
              list.push({
                label,
                path: contentFilePath.split('#')[0]
              })
            }
          })
        }
      }
    }
    setMenu(list);
    handleClick(list[0].path)
  }
  

  const handleClick = (path: string) => {
    const book = bookList.find((item) => item.title === location.state?.title)
    if (book) {
      const zip = book.folder!
      const p = Object.keys(zip.files).find((filename) => filename.endsWith(path))
      if (p) {
        setActive(path)
        zip.file(p)?.async('string').then((content) => {
          setBookContent(content)
          bookRef.current?.scrollTo(0, 0)
        })
      }
    }
  }
  const menuActive = useMemo(() => {
    return menu.find((item) => item.path === active) || {}
  }, [menu, active])
  
  useEffect(() => {
    const book = bookList.find((item) => item.title === location.state?.title)
    getMenu(book?.folder)
  }, [])
  
  return (
    <div>
      <PageContainer
        ghost
        backIcon={<LeftOutlined />}
        header={{
          title: location.state?.title || '',
        }}
        onBack={() => nav('/')}
      >
        <div style={{display: 'flex', overflow: 'hidden'}}>
          <div className={styles.menu}>
            {
              menu.map((item: any) => {
                return <div
                  className={item.path === active ? [styles.menuItem, styles.active].join(' ') : styles.menuItem}
                  key={item.path}
                  onClick={() => handleClick(item.path)}>
                  {item.label}
                </div>
              })
            }
          </div>
          <div className={styles.content} style={{
            backgroundColor: bgColor
          }}>
            <div>
              {
                <div
                  className={styles.title}
                  style={{
                    '--line-height': (parseFloat(lineHeight) < 1 || parseFloat(lineHeight) > 3) ? 1 : lineHeight,
                    '--font-size': fontSize + 'px',
                    '--color-text': colorText,
                  }}
                >{ menuActive.label }</div>
              }
            </div>
            <div
              ref={bookRef}
              className={styles.contentWarp}
              dangerouslySetInnerHTML={{ __html: bookContent }}
              style={{
                '--line-height':  (parseFloat(lineHeight) < 1 || parseFloat(lineHeight) > 3) ? 1 : lineHeight,
                '--font-size': fontSize + 'px',
                '--color-text': colorText,
              }}
            >
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Row gutter={16}>
            <Col className="gutter-row" span={6}>
              <Input addonBefore="行高" value={lineHeight} onChange={(e) => setLineHeight(e.target.value)}/>
            </Col>
            <Col className="gutter-row" span={6}>
              <Space.Compact style={{ width: '100%' }}>
                <Input addonBefore="字体大小" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
                <Select style={{ width: '80px' }} onChange={(value) => setFontSize(value)}>
                  {
                    [12,14,16,18,20,22,24,26,28,30,32].map((item) => {
                      return <Select.Option key={item} value={item}>{item}px</Select.Option>
                    })
                  }
                </Select>
              </Space.Compact>
            </Col>
            <Col className="gutter-row" span={6}>
            <Space.Compact style={{ width: '100%' }}>
              <Input addonBefore="字体颜色" value={colorText} onChange={(e) => setColorText(e.target.value)} />
              <ColorPicker value={colorText} onChange={(value) => setColorText(value.toHexString())} />
            </Space.Compact>
            </Col>
            <Col className="gutter-row" span={6}>
              <Space.Compact style={{ width: '100%' }}>
                <Input addonBefore="背景颜色" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                <ColorPicker value={bgColor} onChange={(value) => setBgColor(value.toHexString())} />
              </Space.Compact>
            </Col>
          </Row>
        </div>
      </PageContainer>
    </div>
  );
};

export default AccessPage;
