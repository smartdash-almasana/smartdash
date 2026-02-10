import os
import requests

def test_secrets():
    print("🔍 Iniciando diagnóstico de configuración...")
    
    # Traer los secretos
    url = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
    sb_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    groq_key = os.getenv('GROQ_API_KEY', '')

    # 1. Test de URL de Supabase
    if not url:
        print("❌ NEXT_PUBLIC_SUPABASE_URL: No configurada.")
    elif "\n" in url or " " in url or "%" in url:
        print(f"❌ NEXT_PUBLIC_SUPABASE_URL: ¡Cuidado! Tiene espacios o saltos de línea invisibles.")
    else:
        print(f"✅ NEXT_PUBLIC_SUPABASE_URL: Formato correcto ({url[:15]}...)")

    # 2. Test de Supabase Key
    if not sb_key:
        print("❌ SUPABASE_SERVICE_ROLE_KEY: No configurada.")
    else:
        print(f"✅ SUPABASE_SERVICE_ROLE_KEY: Cargada (Largo: {len(sb_key)} caracteres)")

    # 3. Test de Groq Key
    if not groq_key:
        print("❌ GROQ_API_KEY: No configurada.")
    elif not groq_key.startswith("gsk_"):
        print("⚠️ GROQ_API_KEY: No parece una clave de Groq válida (debería empezar con gsk_)")
    else:
        print("✅ GROQ_API_KEY: Formato inicial correcto.")

    # 4. Prueba de conexión real a Supabase (solo ping)
    if url and sb_key:
        try:
            headers = {"apikey": sb_key.strip(), "Authorization": f"Bearer {sb_key.strip()}"}
            res = requests.get(f"{url.strip()}/rest/v1/", headers=headers)
            if res.status_code == 200:
                print("🚀 CONEXIÓN EXITOSA: Supabase responde correctamente.")
            else:
                print(f"⚠️ Supabase respondió con error {res.status_code}. Revisar la Service Role Key.")
        except Exception as e:
            print(f"❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_secrets()