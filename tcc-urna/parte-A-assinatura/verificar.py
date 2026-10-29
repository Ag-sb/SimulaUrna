"""
verificar.py  —  papel de quem confere a integridade (simulação didática)

Lê o arquivo, a assinatura (.sig) e a chave pública (.pem) e diz se o arquivo
continua exatamente igual ao que foi assinado.

Uso:  python verificar.py [caminho_do_arquivo]
"""
import sys
import hashlib
from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature

PASTA = Path(__file__).parent / "exemplos"
arquivo = Path(sys.argv[1]) if len(sys.argv) > 1 else PASTA / "programa_ficticio.bin"

dados = arquivo.read_bytes()
assinatura = arquivo.with_suffix(".sig").read_bytes()
chave_publica = serialization.load_pem_public_key((arquivo.parent / "chave_publica.pem").read_bytes())

print(f"Arquivo  : {arquivo.name}")
print(f"Hash SHA-256 atual: {hashlib.sha256(dados).hexdigest()}")

try:
    chave_publica.verify(
        assinatura,
        dados,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256(),
    )
    print("✔ Assinatura válida: o arquivo não foi alterado.")
except InvalidSignature:
    print("✘ ASSINATURA INVÁLIDA: o arquivo foi alterado!")