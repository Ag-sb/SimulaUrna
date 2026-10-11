"""
assinar_arquivo.py  —  papel do "TSE" (simulação didática)

Gera um par de chaves RSA, assina um arquivo e salva:
  - exemplos/programa_ficticio.sig   (a assinatura)
  - exemplos/chave_publica.pem       (a chave pública, que pode ser divulgada)

A chave privada NÃO é salva: fica só na memória e é descartada ao final.

Uso:  python assinar_arquivo.py [caminho_do_arquivo]
"""
import sys
import hashlib
from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding

PASTA = Path(__file__).parent / "exemplos"
arquivo = Path(sys.argv[1]) if len(sys.argv) > 1 else PASTA / "programa_ficticio.bin"

dados = arquivo.read_bytes()

chave_privada = rsa.generate_private_key(public_exponent=65537, key_size=2048)
chave_publica = chave_privada.public_key()

assinatura = chave_privada.sign(
    dados,
    padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
    hashes.SHA256(),
)

arquivo.with_suffix(".sig").write_bytes(assinatura)
(arquivo.parent / "chave_publica.pem").write_bytes(
    chave_publica.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
)

print(f"Arquivo assinado : {arquivo.name}")
print(f"Hash SHA-256     : {hashlib.sha256(dados).hexdigest()}")
print(f"Assinatura salva : {arquivo.with_suffix('.sig').name}")
print("Chave pública salva: chave_publica.pem")