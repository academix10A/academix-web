import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalService } from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function PaypalButton({ idMembresia }) {
    const { token } = useAuth();

    const createOrder = async () => {
        const data = await paypalService.createOrder(idMembresia, token);
        return data.orderID;
    };

    const onApprove = async (data) => {
        const result = await paypalService.captureOrder(
            data.orderID,
            idMembresia,
            token
        );

        if (result.success) {
            alert("Pago completado");
        } else {
            console.log(result);
            alert("Error en el pago");
        }
    };

    return (
        <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
        />
    );
}