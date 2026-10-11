"""
Demonstração didática: assinatura digital e hash (SHA-256)
Ideia: mostrar que alterar UM byte de um "programa" invalida a assinatura.

Instalação:  pip install cryptography
Execução:    python demo_assinatura.py

ATENÇÃO: é uma simulação educativa. Não é o software real da urna.
"""
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature


def sha256(dados: bytes) -> str:
    return hashlib.sha256(dados).hexdigest()


def assinar(chave_privada, dados: bytes) -> bytes:
    return chave_privada.sign(
        dados,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256(),
    )


def verificar(chave_publica, dados: bytes, assinatura: bytes) -> bool:
    try:
        chave_publica.verify(
            assinatura,
            dados,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256(),
        )
        return True
    except InvalidSignature:
        return False


def main():
    # 1) "Programa" fictício da urna (poderia ser qualquer arquivo)
    programa = b"SOFTWARE_URNA_FICTICIO v1.0\n" + b"contabiliza_voto();\n" * 50

    # 2) O "TSE" gera o par de chaves (a privada fica só com ele)
    chave_privada = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    chave_publica = chave_privada.public_key()

    # 3) O "TSE" assina o programa depois da inspeção
    assinatura = assinar(chave_privada, programa)
    print("=== PROGRAMA ORIGINAL ===")
    print("Hash SHA-256 :", sha256(programa))
    print("Assinatura OK?", verificar(chave_publica, programa, assinatura))

    # 4) Alguém altera UM byte do programa
    adulterado = bytearray(programa)
    adulterado[30] ^= 0x01  # inverte 1 bit de 1 byte
    adulterado = bytes(adulterado)

    print("\n=== PROGRAMA ADULTERADO (1 byte alterado) ===")
    print("Hash SHA-256 :", sha256(adulterado))
    print("Assinatura OK?", verificar(chave_publica, adulterado, assinatura))

    # 5) Efeito avalanche: quantos caracteres do hash mudaram?
    h1, h2 = sha256(programa), sha256(adulterado)
    diferentes = sum(a != b for a, b in zip(h1, h2))
    print(f"\nEfeito avalanche: {diferentes} de {len(h1)} caracteres do hash mudaram.")


if __name__ == "__main__":
    main()
