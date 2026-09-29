# Dnevni izveštaj - Quattro Kong

**Datum:** 26.09.2026.

## Šta sam uradila

Danas sam, uz pomoć AI asistenta, unapredila aplikaciju Quattro Kong:

- Implementirala sam stvarnu razliku između težina: na **Easy** nivou opasnosti se kreću sporije, a zaštita posle sudara traje duže nego na **Normal** nivou.
- Dodala sam izbor težine u interfejs. Promena težine započinje novu partiju.
- Dodala sam beleženje uzroka i mesta gubitka života, kao i dugme **Get hint**.
- Povezala sam igru sa lokalnim serverom koji šalje podatke o sudaru OpenAI modelu, bez izlaganja API ključa u kodu pregledača.
- Proverila sam aplikaciju: prolaze typecheck, build i svih **53 testa**.

## Testiranje i ograničenje

Pokrenula sam aplikaciju i testirala zahtev za savet. OpenAI API je vratio `429` jer na nalogu nema preostalih kredita, pa stvarno generisanje saveta još nije potvrđeno.
