const mp = new MercadoPago('TEST-d0ed6155-f465-4e50-9b8b-76a052e5519b', {
    locale: "es-CL"
});

// Función única para convertir precios
function convertirPrecio(precioTexto) {
    const precioLimpio = precioTexto
        .replace(/\$/g, '')   // Eliminar símbolo de moneda
        .replace(/\./g, '')   // Eliminar separadores de miles
        .replace(/,/g, '.');  // Convertir coma decimal a punto

    const precio = parseFloat(precioLimpio);
    
    if (isNaN(precio)) {
        throw new Error("Formato de precio inválido");
    }
    
    return precio;
}

// Configuración genérica para manejar múltiples botones
function setupMercadoPagoButton(buttonId, priceElementId, walletContainerId) {
    document.getElementById(buttonId).addEventListener("click", async () => {
        try {
            const totalPagarDiv = document.getElementById(priceElementId);
            
            if (!totalPagarDiv) {
                throw new Error(`No se encontró el precio para ${buttonId}`);
            }

            const precioTexto = totalPagarDiv.textContent.trim();
            const precio = convertirPrecio(precioTexto);

            const response = await fetch("https://tag-iota.vercel.app/create_preference", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Total a pagar:",
                    quantity: 1,
                    price: precio
                }),
            });
            
            const preference = await response.json();
            createCheckoutButton(preference.id, walletContainerId);

        } catch(error) {
            alert(error.message);
        }
    });
}

// Inicializar ambos botones con sus respectivos elementos
setupMercadoPagoButton("btn-mp1", "saldo2", "wallet_container1");
setupMercadoPagoButton("btn-mp2", "medioSaldo", "wallet_container2");

// Función modificada para manejar múltiples contenedores
const createCheckoutButton = (preferenceId, containerId) => {
    const bricksBuilder = mp.bricks();

    const renderComponent = async () => {
        // Destruir instancia previa si existe
        if (window.checkoutButtons && window.checkoutButtons[containerId]) {
            window.checkoutButtons[containerId].unmount();
        }

        window.checkoutButtons = window.checkoutButtons || {};
        
        window.checkoutButtons[containerId] = await bricksBuilder.create("wallet", containerId, {
            initialization: { preferenceId: preferenceId },
            customization: { texts: { valueProp: 'smart_option' } }
        });
    };

    renderComponent();
};