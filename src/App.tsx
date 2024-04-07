import {AppRoot} from "@xelene/tgui";
import {TonConnectUIProvider} from "@tonconnect/ui-react";
import {Header} from "./Header.tsx";
import {Content} from "./Content.tsx";

function App() {
    return <TonConnectUIProvider manifestUrl="https://siandreev.github.io/web3-hk-sample/tonconnect-manifest.json">
        <AppRoot>
            <Header />
            <Content />
        </AppRoot>
    </TonConnectUIProvider>
}

export default App
