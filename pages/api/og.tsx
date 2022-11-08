import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'experimental-edge',
};
const font = fetch('https://d23ymo475owmp.cloudfront.net/shindanapp/LINESeedJP_TTF_Rg.ttf').then(
  (res) => res.arrayBuffer(),
)

export default async function (req: NextRequest) {
  const fontData = await font
  const { searchParams } = new URL(req.url)
  const hasTitle = searchParams.has('title')
  const title = hasTitle
    ? (searchParams.get('title')?.slice(0, 100) || '')
    : ''
  const fontSize = 1000 / title.length > 128 ? 128 : 1000 / title.length
  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        fontFamily: 'LINESeedJPStd',
        flexDirection: 'column',
        background: '#dbf5ff',
        width: '100%',
        height: '100%',
        padding: 80,
      }}>
        <div
          style={{
            background: 'white',
            width: '100%',
            height: '80%',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50
          }}
        >
          <div style={{ fontSize: fontSize }}>{title}</div>
        </div>
        <div
          style={{
            fontSize: 20,
            background: 'white',
            width: '100%',
            height: '10%',
            display: 'flex',
            textAlign: 'right',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: 50,
            borderBottomLeftRadius: 50,
            borderBottomRightRadius: 50
          }}
        >
          あなたもいますぐ診断 shindanapp
        </div>
      </div>

    ),
    {
      width: 1200,
      height: 600,
      fonts: [
        {
          name: 'LINESeedJPStd',
          data: fontData,
          style: 'normal',
        },
      ],
      emoji: 'twemoji'
    },
  );
}