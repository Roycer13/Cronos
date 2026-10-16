<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error</title>
    <style>
        /* Reset básico */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
        }

        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #3436c4, #5226b9, #c22272);
            color: #fff;
            padding: 20px;
        }

        .error-container {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 2rem;
            padding: 3rem 2rem;
            max-width: 450px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .error-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1rem;
            animation: bounce 1.2s infinite alternate;
        }

        @keyframes bounce {
            0% {
                transform: translateY(0);
            }

            100% {
                transform: translateY(-15px);
            }
        }

        .error-code {
            font-size: 5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
        }

        .error-title {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .error-message {
            font-size: 1rem;
            opacity: 0.85;
            margin-bottom: 2rem;
        }

        .error-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
        }

        .btn {
            padding: 0.6rem 1.5rem;
            border-radius: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: #fff;
            color: #6366f1;
        }

        .btn-primary:hover {
            background: rgba(255, 255, 255, 0.9);
        }

        .btn-secondary {
            border: 2px solid #fff;
            color: #fff;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }



        @media(max-width: 500px) {
            .error-code {
                font-size: 4rem;
            }

            .error-title {
                font-size: 1.5rem;
            }

            .error-message {
                font-size: 0.9rem;
            }
        }
    </style>
</head>

<body>

    <div class="error-container">

        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640" class="error-icon" fill="currentColor">
            <path
                d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 384C302.3 384 288 398.3 288 416C288 433.7 302.3 448 320 448C337.7 448 352 433.7 352 416C352 398.3 337.7 384 320 384zM320 192C301.8 192 287.3 207.5 288.6 225.7L296 329.7C296.9 342.3 307.4 352 319.9 352C332.5 352 342.9 342.3 343.8 329.7L351.2 225.7C352.5 207.5 338.1 192 319.8 192z" />
        </svg>
        
        <!-- Código de error -->
        <div class="error-code">403</div>

        <!-- Título -->
        <div class="error-title">Acceso denegado</div>

        <!-- Mensaje secundario -->
        <div class="error-message">
            Lo sentimos, no tienes permiso para acceder a esta página.
        </div>

        <!-- Botones -->
        <div class="error-buttons">
            <a href="{{ url('/') }}" class="btn btn-primary">Volver al inicio</a>
            @if (url()->previous())
                <a href="{{ url()->previous() }}" class="btn btn-secondary">← Volver atrás</a>
            @endif
        </div>
    </div>



</body>

</html>
