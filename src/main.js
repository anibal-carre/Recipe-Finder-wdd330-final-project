import { header } from "./components";
document.querySelector("#app").innerHTML = `
  <div>
    ${header}

    <div class="container">
      <div class="main-content">
      
      </div>
    </div>
  </div>
`;

setupCounter(document.querySelector("#counter"));
