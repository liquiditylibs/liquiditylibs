# Liquidator Documentation

## 🌐 English Version

### Considerations

The project includes the following considerations:

1. **ERC20**:

    - A commonly used ERC20 must exist; in this case, for testing purposes, we are using USDL (a simulated non-real representation that will emulate USDT in the real market on this test network. Its use is limited to testing a contract with a similar interface and testing the flow in a controlled environment).
    - This ERC20 has two necessary functions for us: "transfer" and "transferFrom." The first is used to send contract funds to the receiver, and the second to send funds from the user requesting the off-ramp to the contract.

2. **Variables**:

    - `IERC20 public token`: Interface of the ERC20 used to instantiate our USDL (L of Liquidator).
    - `address public owner`: The contract owner is public and is a liquidator's address.
    - `uint256 public totalTxs`: The total number of transactions performed by the contract.
    - `bool public paused`: Boolean used as a safety measure to lock the contract and prevent a security issue from affecting involved users.
    - `mapping(address => bool) public frogs`: A mapping with the whitelist of validated individuals allowed to mediate in case of a dispute.
    - `mapping(address => uint256) public balance`: Balance of users who have worked for the Liquidator (Owner or frogs).
    - `mapping(address => bool) public liquidators`: Mapping with the addresses of wallets that can receive the crypto and act as liquidators.
    - `mapping(address => address) public busy`: Mapping with the address of the wallet that received an order and is in a process with another wallet.
    - `struct receiverStruct { address receiver; uint256 amount; }`: Struct with information about the liquidator and the amount to be liquidated.
    - `mapping(address => receiverStruct) public transfers`: Mapping with the address of the initiator of the request related to the one who takes it.

3. **Modifiers**:

    - `onlyFrogs`: Modifier that allows only frogs to execute a specific function.
    - `onlyOwner`: Modifier that allows only the contract owner to run a specific function.
    - `isPaused`: Modifier that validates if the contract is paused to prevent executing a specific function.

4. **Events**:

    - `Deposit`: Event that notifies the deposit from whom to whom and how much.
    - `Withdrawal`: Event that notifies the withdrawal of whom and how much.
    - `TransferConfirmed`: Event that notifies the confirmation of a transaction from whom to whom and how much.
    - `TransferCancelled`: Event that notifies the cancellation of a transaction from whom to whom and how much.
    - `Paused`: Event that notifies whether the contract was paused or unpaused and which address did it.
    - `Frogs`: Event that notifies if an address was added or removed from being a frog.
    - `Liquidators`: Event that notifies if an address was added or removed from being a Liquidator.

5. **Functions**:

    ### Private

    - `getTax`: Function that calculates the tax charged to the user based on the total transactions a contract has had.
    - `distributeTax`: Function that distributes the taxes charged in the case of frog intervention.
    - `_confirm`: Reusable function that confirms a transaction by the user who initiated it or by a frog.

    ### External

    - `deposit`: Allows depositing the token into the contract securely.
    - `confirm`: Allows the user who deposited the token to confirm that the transaction was successful.
    - `confirmFrog`: Allows a frog to confirm the success of a transaction in case the involved parties do not agree.
    - `cancel`: Allows a frog to reject and return a transaction to the initiator in case the involved parties do not agree.
    - `withdraw`: Allows contributors to the Liquidator contract to withdraw their commissions.
    - `addFrog`: Allows the contract owner to add addresses to the frog whitelist.
    - `removeFrogs`: Allows the contract owner to revoke frog permissions from a list of addresses.
    - `addLiquidator`: Allows the contract owner to add addresses to the liquidator whitelist.
    - `removeLiquidator`: Allows the contract owner to revoke liquidator permissions from a list of addresses.
    - `pauseContract`: Allows the contract owner to pause the contract in case of any inconvenience.

### Running the Project

To run this project, you need to follow these steps in your terminal:

1. `npm i`
2. `npx hardhat compile`
3. `npm run init`

Open a new terminal and run the following:

1. `npm run deploy-local`
2. `npm run get-budget`

Once everything has run, a .json file with gas consumption estimates will open automatically.

### Commissions and Business Model

For this project, four actors are involved: a client, a liquidator, a frog (mediator), and the owner of Liquidator. Below are specified the benefits and duties of each role.

1. **Client**:

    - Has the right to use the platform to off-ramp their crypto assets and pay in fiat in any country allied with Liquidator. Their duty is to respond clearly and honestly when asked for transaction confirmation to minimize the need for frogs intervention. In case of suspicion of dishonesty, a frog will intervene.
    - This type of user pays a rate to the liquidator and a commission to the owner of the contract for requesting the services.

2. **Liquidador**:

    - Has the right to have user traffic using the platform for everyday payments. Their duty is to respond clearly and honestly when making payments, fulfilling the client's request to minimize the need for frogs intervention. In case of suspicion of dishonesty, a frog will intervene.
    - This type of user does not pay a commission but must undergo a KYC process to validate the origin of fiat funds.

3. **Frog**:

    - Has the right to act in a transaction, earning a commission for resolving a conflict. Their duty is to respond clearly and honestly based on the evidence received and only intervene when required, to incur the least amount of commission costs for users (client - liquidator) and the organization (Liquidator's administrators).
    - This type of user does not pay a commission but must undergo a KYC process to validate trustworthiness.

4. **Liquidator's administrators**:

    - Has the right to receive a commission for each transaction according to the rules stipulated in the contract. Their duty is to provide security and technological infrastructure to clients, liquidators, and frogs so they can continue their contributions and negotiations in a clear and transparent manner.

The current commissions are as follows:

1. For platform usage:
    - Up to one hundred transactions, 0% commission
    - From one hundred to less than a thousand, 0.5% of the transacted value.
    - From one thousand transactions onwards, 1% of the transacted value.
2. For liquidator usage:
    - The liquidator converts the crypto at a predetermined rate in which they already have a profit.
3. For frogs usage in case of dispute:
    - Since it is estimated that dispute cases will not be frequent, the platform's earnings are distributed with a 50% share for the frogs helping to resolve the conflict, so the user does not have to pay an additional commission.

## 🌐 Versión en Español

### Consideraciones

El proyetco tiene las siguientes consideraciones:

1.  **ERC20**:

    -   Debe existir un ERC20 de uso común; en este caso, para pruebas, estamos utilizando USDL (una representación simulada no real que emulará USDT en el mercado real en esta red de prueba. Su uso está limitado a probar un contrato con una interfaz similar y probar el flujo en un entorno controlado).
    -   Este ERC20 tiene dos funciones necesarias para nosotros: "transfer" y "transferFrom". La primera se utiliza para enviar los fondos del contrato al receptor, y la segunda para enviar los fondos del usuario que solicita el off-ramp al contrato.

2.  **Variables**:

    -   `IERC20 public token`: Interfaz del ERC20 que usamos para poder instanciar nuestro USDL (L de Liquidator).
    -   `address public owner`: El propietario del contrato es público y es una dirección de liquidator.
    -   `uint256 public totalTxs`: El total de transacciones realizadas por el contrato.
    -   `bool public paused`: Booleano utilizado como medida de seguridad para bloquear el contrato y evitar que un problema de seguridad afecte a los usuarios involucrados.
    -   `mapping(address => bool) public frogs`: Un mapeo con la lista blanca de individuos validados para mediar en caso de una disputa.
    -   `mapping(address => uint256) public balance`: Balance de usuarios que han trabajado para el Liquidator (propietario o frogs).
    -   `mapping(address => bool) public liquidators`: Mapeo con las direcciones de las billeteras que pueden recibir el cripto y actuar como liquidadores.
    -   `mapping(address => address) public busy`: Mapeo con la dirección de la billetera que recibió un pedido y está en proceso con otra billetera.
    -   `struct receiverStruct { address receiver; uint256 amount; }`: Estructura con información del liquidador y de la cantidad a liquidar.
    -   `mapping(address => receiverStruct) public transfers`: Mapeo con la dirección de quien inicia la solicitud relacionada con quien la toma.

3.  **Modificadores**:

    -   `onlyFrogs`: Modificador que permite que solo los frogs ejecuten una función específica.
    -   `onlyOwner`: Modificador que permite que solo el dueño del contrato pueda ejecutar una función específica.
    -   `isPaused`: Modificador que valida si el contrato está pausado para no permitir la ejecución de una función específica.

4.  **Eventos**:

    -   `Deposit`: Evento que notifica el depósito de quién a quién y cuánto.
    -   `Withdrawal`: Evento que notifica el retiro de quién y cuánto.
    -   `TransferConfirmed`: Evento que notifica que se confirmó una transacción de quién a quién y cuánto.
    -   `TransferCancelled`: Evento que notifica que se canceló una transacción de quién a quién y cuánto.
    -   `Paused`: Evento que notifica si se pausó o despausó el contrato y qué dirección lo hizo.
    -   `Frogs`: Evento que notifica si se agregó o retiró una dirección de ser sapo.
    -   `Liquidators`: Evento que notifica si se agregó o retiró una dirección de ser Liquidador.

5.  **Funciones**:

    ### Privadas

    -   `getTax`: Función que permite calcular el impuesto cobrado al usuario con base en el total de transacciones que ha tenido un contrato.
    -   `distributeTax`: Función que distribuye los impuestos cobrados en caso de la intervención de un sapo.
    -   `_confirm`: Función reutilizable que confirma una transacción por el usuario que la inició o por un sapo.

    ### Externas

    -   `deposit`: Permite depositar el token en el contrato de manera segura.
    -   `confirm`: Permite que el usuario que depositó el token confirme que la transacción se realizó correctamente.
    -   `confirmFrog`: Permite que un sapo confirme el éxito de una transacción en caso de que los involucrados no se pongan de acuerdo.
    -   `cancel`: Permite que un sapo rechace y devuelva una transacción a quien la inició en caso de que los involucrados no se pongan de acuerdo.
    -   `withdraw`: Permite que los contribuyentes al contrato liquidador retiren sus comisiones.
    -   `addFrog`: Permite que el dueño del contrato agregue direcciones a la lista blanca de sapos.
    -   `removeFrogs`: Permite que el dueño del contrato revoque permisos de ser sapo a una lista de direcciones.
    -   `addLiquidator`: Permite que el dueño del contrato agregue direcciones a la lista blanca de liquidadores.
    -   `removeLiquidator`: Permite que el dueño del contrato revoque permisos de ser liquidador a una lista de direcciones.
    -   `pauseContract`: Permite que el dueño del contrato pause el contrato en caso de algún inconveniente.

## Ejecutar el Proyecto

Para ejecutar este proyecto, debes seguir los siguientes pasos en tu terminal:

1. `npm i`
2. `npx hardhat compile`
3. `npm run init`

Abrir una nueva terminal y ejecutar lo siguiente:

1. `npm run deploy-local`
2. `npm run get-budget`

Una vez que todo se haya ejecutado, se abrirá automáticamente un archivo .json con las estimaciones de consumo de gas.

### Comisiones y modelo de negocio

Para este proyecto están involucrados cuatro actores, un cliente, un liquidador, un sapo y el dueño de liquidator, a continuación se especifican los beneficios y deberes de cada rol.

1. **Cliente**:

    - Tiene derecho a usar la plataforma para hacer off-ramp de sus criptoactivos y pagar en fiat en cualquier pais aliado a Liquidator, su deber es responder de manera clara y honesta al momento que se le solicite confirmación de una transacción para requerir lo minimo posible la intervención de un sapo, en el caso de sospecha de falta de honestidad entrará un sapo a actuar.
    - Este tipo de usuario paga una tasa al liquidador y una comisión al dueño del contrato por el hecho de solicitar los servicios del mismo.

2. **Liquidador**:

    - Tiene el derecho de tener un trafico de usuarios que quieren usar la plataforma para realizar pagos cotidianos, su deber es responder de manera clara y honesta al momento de realizar los pagos, cumpliendole al cliente en su solicitud, esto para requerir lo minimo posible la intervención de un sapo, en el caso de sospecha de falta de honestidad entrará un sapo a actuar.
    - Este tipo de usuario no paga comisión, pero debe pasar por un proceso de KYC para validar la procedencia de los fondos FIAT.

3. **Sapo**:

    - Tiene derecho de actuar en una transacción ganandose una comisión por resolver un conflicto, su deber es responder de manera clara y honesta bajo la evidencia recibida y solo intervenir cuando se es requerido, para incurrir en la menor cantidad de costos de comisión para los usuarios (cliente - liquidador) y la organización (Administradores de Liquidator)
    - Este tipo de usuario no paga comisión, pero debe pasar por un proceso de KYC para validar confianza de la entidad.

4. **Administradores de Liquidator**:

    - Tiene derecho de recibir una comisión por cada transacción según las reglas estipuladas en el contrato, su deber es proveer de seguridad e infraestructura tecnologica a los clientes, liquidadores y sapos, para que puedan continuar con sus contribuciones y negociaciones de manera clara y transparente.

Las comisiones actuales son las siguientes:

1. Por uso de la plataforma:
    - Hasta cien transacciones del contrato, 0%
    - De cien a menos de mil, 0.5% del valor transado.
    - Desde mil transacciones, 1% del valor transado.
2. Por uso del liquidador:
    - El liquidador liquida el crypto a una tasa determinada en la que ya tiene una ganancia.
3. Por uso del sapo en caso de disputa:
    - Ya que se estima que no sean muchos los casos de disputa se distribuye las ganancias de la plataforma en un 50% para el sapo que ayude a resolver el conglicto, por lo que el usuario no debe pagar comisión adicional.
