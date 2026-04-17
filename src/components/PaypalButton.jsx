import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function PaypalButton({ idMembresia }) {
    const { token, refreshUser } = useAuth();
    const navigate = useNavigate();

    const createOrder = async () => {
        const data = await paypalService.createOrder(idMembresia, token);
        return data.orderID;
    };

    const onApprove = async (data) => {
        try {
            const result = await paypalService.captureOrder(
                data.orderID,
                idMembresia,
                token
            );

            if (result.success) {
                await refreshUser();
                // Redirigir sin alerts
                navigate("/biblioteca", { replace: true });
            } else {
                console.error("Error en el pago:", result);
            }
        } catch (error) {
            console.error("Error inesperado:", error);
        }
    };

    return (
        <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
        />
    );
}