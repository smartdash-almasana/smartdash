import os
from dotenv import load_dotenv
from supabase import create_client
from groq import Groq

# 1. Cargamos las credenciales desde tu .env.local
load_dotenv(dotenv_path=".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

# 2. Inicializamos los clientes
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
groq = Groq(api_key=GROQ_KEY)

def ejecutar_diagnostico():
    # 3. Traemos datos de la vista de riesgos (Fuente de la Verdad)
    # Ajusta 'clientes' por el nombre exacto de tu tabla o vista
    try:
        response = supabase.table("clientes").select("*").eq("nombre_comercial", "FinTech Pro").execute()
        cliente = response.data[0] if response.data else None

        if not cliente:
            return "❌ Cliente no encontrado en Supabase."

        # 4. Le pedimos a Groq que analice
        analisis = groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres el motor de SmartDash FV. Analiza riesgos operativos."},
                {"role": "user", "content": f"Analiza este perfil de cliente y detecta 3 riesgos potenciales: {cliente}"}
            ]
        )
        return analisis.choices[0].message.content

    except Exception as e:
        return f"❌ Error en el proceso: {e}"

if __name__ == "__main__":
    print("🚀 Iniciando Auditoría Predictiva SmartDash FV...")
    print(ejecutar_diagnostico())
    