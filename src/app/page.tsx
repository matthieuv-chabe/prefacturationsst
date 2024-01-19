import Image from 'next/image'
import { redirect } from 'next/navigation';
import App from "next/app";

Home.getInitialProps = async ({}) => {
  return {  }
}

export default function Home() {

  redirect("/dashboard");

  return (
    <>Loading...</>
  )
}
