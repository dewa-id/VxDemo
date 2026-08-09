import { LoginPage } from "./LoginPage";
import { BankHome } from "./BankHome";
import {
  CALLBACK_PATH,
  bankFromCallback,
  parseCallbackParams,
  purposeFromCallback,
  BANKS,
} from "./banks";

function App() {
  // Simple path-based routing — the callback URL renders the themed bank home,
  // everything else shows the bank picker.
  if (window.location.pathname === CALLBACK_PATH) {
    const params = parseCallbackParams();
    const bank = bankFromCallback(params) ?? BANKS[0];
    const purpose = purposeFromCallback(params);
    return <BankHome bank={bank} params={params} purpose={purpose} />;
  }

  return <LoginPage />;
}

export default App;
