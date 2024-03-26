
export const dynamic = 'force-dynamic'

export default function Layout({children}: {children: any}) {
    return (<html lang="en">
    <head>
        <title>Chabé Préfacturation SST</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>

    </head>
    <body>{children}</body>
    </html>)
}

