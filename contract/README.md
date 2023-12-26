# Liquidator Documentation

## 🌐 English Version

### Considerations

The project has the following considerations:

1.  **ERC20**:

    -   A commonly used ERC20 must exist, in this case for testing, we are using USDL (It is a simulated non-real representation, which will emulate a USDT in the real market in this test network, its use is limited to testing a contract with a similar interface, and test the flow in a controlled environment)
    -   This ERC20 has two functions necessary for us "transfer" and "transferFrom", the first is used to send the funds from the contract to the recipient, and the second to send the funds of the user who requests the off-ramp to the contract.

2.  **Variables**:

    -   `IERC20 public token`: ERC20 interface that we use to instantiate our USDL (L for liquidator)
    -   `address public owner`: The owner of the contract is public, and is a liquidator address.
    -   `uint256 public totalTxs`: The total transactions made by the contract.
    -   `uint256 private balanceOwner`: The balance of the contract that can be delivered to its owner.
    -   `mapping(address => bool) public frogs`: A mapping with the whitelist of people validated to enter to mediate in case of dispute.
    -   `mapping(address => uint256) private receivers`: mapping with the address of the wallet that will receive the crypto at the end (liquidator) and the amount that will be received for making the transaction.
    -   `mapping(address => receivers) private transfers`: mapping with the address of who initiates the request related to who takes it.
    -   `bool public isPaused`: Boolean used as insurance to block the contract and prevent a security problem from affecting the users involved.

3.  **Modifiers**:

    -   `onlyFrogs`: Modifier that allows only frogs to execute a specific function.
    -   `onlyOwner`: Modifier that allows only the owner of the contract to run the specific function.
    -   `isPaused`: Modifier that validates if the contract is paused to prevent a specific function from being executed.

4.  **Functions**:

    -   `deposit`: Allows you to deposit the token in the contract safely.
    -   `confirm`: Allows the user who deposited the token to confirm that the transaction was successful
    -   `confirmFrog`: Allows a frog to confirm the success of a transaction in the event that those involved cannot agree.
    -   `_confirm`: Local function with confirmation logic.
    -   `cancel`: Allows a frog to redo and return a transaction to the person who initiated it in the event that those involved do not agree.
    -   `withdraw`: Allows the owner of the contract to withdraw his commissions.
    -   `addFrog`: Allows the contract owner to whitelist address frog.
    -   `removeFrogs`: Allows the contract owner to revoke frog permissions to an address list.

## Run the project

To run this project, you have to follow the following steps in your terminal

1. `npm i`
2. `npx hardhat compile`

## 🌐 Versión en Español

### Consideraciones

El proyetco tiene las siguientes consideraciones:

1.  **ERC20**:

    -   Un ERC20 de uso común tiene que existir, en este caso para pruebas, estamos usando USDL (Es una representación no real simulada, que emulará en esta red de prueba un USDT en el mercado real, su uso es limitado a probar un contrato con una interfaz similar, y testear el flujo en un ambiente controlado)
    -   Este ERC20 tiene dos funciones necesarias para nosotros "transfer" y "transferFrom", la primera es usada para poder enviar los fondos del contrato al receptor, y la segunda para enviar los fondos del usuario que solicita el off-ramp al contrato.

2.  **Variables**:

    -   `IERC20 public token`: Interfaz del ERC20 que usamos para poder instanciar nuestro USDL (L de liquidator)
    -   `address public owner`: El owner del contrato es público, y es una address de liquidator.
    -   `uint256 public totalTxs`: El total de transacciones realizadas por el contrato.
    -   `uint256 private balanceOwner`: El balance del contrato que le puede ser entregado al owner del mismo.
    -   `mapping(address => bool) public frogs`: Un mapping con el whitelist de las personas validadas para entrar a mediar en caso de disputa.
    -   `mapping(address => uint256) private receivers`: mapping con la address de la wallet que recibirá el crypto al final (liquidador) y la cantidad que recibirá por hacer la transacción.
    -   `mapping(address => receivers) private tranfers`: mapping con la address de quien inicia la solicitud relacionada con quien la toma.
    -   `bool public isPaused`: Booleano usado como seguro para bloquear el contrato y prevenir que un problema de seguridad afecte a los usuarios involucrados.

3.  **Modificadores**:

    -   `onlyFrogs`: Modificador que permite que solo los frogs ejecuten una función especifica.
    -   `onlyOwner`: Modificador que permite que solo el dueño del contrato pueda correr la función especifica.
    -   `isPaused`: Modificador que valida si el contrato está pausado para no dejar ejecutar una función especifica.

4.  **Funciones**:

    -   `deposit`: Permite depositar el token en el contrato de manera segura
    -   `confirm`: Permite que el usuario que deposito el token confirme que la transacción se realizó correctamente
    -   `confirmFrog`: Permite que un frog confirme el exito de una transacción en el caso de que los involucrados no se pongan deacuerdo.
    -   `confirm`: Función local con la logica de la confirmación.
    -   `cancel`: Permite que un frog reahacé y devuelva una transacción a quien la inició en el caso de que los involucrados no se pongan de acuerdo.
    -   `withdraw`: Permite que el dueño del contrato retire sus comisiones.
    -   `addFrog`: Permite que el dueño del contrato agregue a la lista blanca address frog.
    -   `removeFrogs`: Permite que el dueño del contrato revoque permisos de ser frog a una lista de address.

## Correr el proyecto

Para correr este proyecto, tienes que seguir los siguientes pasos en tu terminal

1.  `npm i`
2.  `npx hardhat compile`
