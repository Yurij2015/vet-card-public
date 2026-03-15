import type { GetStaticProps, GetStaticPaths } from 'next'
import MyAppointmentsPage from '@/pages/MyAppointmentsPage'

interface Props {
  lang: string
}

export default function MyAppointmentsRoute({ lang }: Props) {
  return <MyAppointmentsPage lang={lang} />
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['uk', 'en']
  return {
    paths: locales.map((lang) => ({ params: { lang } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const lang = context.params?.lang as string || 'uk'
  return { props: { lang } }
}
