# User-Forum

Alvin 2023-04-04

## Inledning

Syftet med det här arbetet var sätta samman de två tidigare projekten där vi skapade ett forum och ett system för användare och inloggning. Arbetet använde sig av html, javascript och sql för att koppla en databas till webbsidan för att spara information.


## Bakgrund
Det första som jag gjorde var att skapa ett nytt reposotory för projektet. Sedan tittade jag på det tidigare arbetet där vi hade skapat ett forum och lade in den koden till det nya projektet. Jag laddade ner alla paket som krävdes för arbetet till exempel express och mysql2. När jag hade fått den gamla koden att fungear i det nya projektet började jag implementera delar från koden för inloggnignsystemet som vi tidigare gjorde. När sidan fungerade med båda systemen implementerade började jag arbeta för att förbättra sidans funktionalitet. Jag gjorde att man kunde se alla sina egna posts på sin profil och att man bara kan skriva inlägg om man är inloggad med ett konto. Sedan gjorde jag sidan säker från mysql injections och XSS attacker genom att använda validator för att tvätta datan. Jag validerade när man skrev en nytt inlägg så det måste ha ett innehåll. För säkerhet validerade jag även användarnamnet så det kan bara innehålla bokstäver och nummer och så att lösenordet måste vara minst 8 tecken lång. Jag gjorde lite mer fixande med utseende som att fixna knappar och göra sidan snyggare. Det sissta jag gjorde var att implementera ett filter som censurerade fula ord på engelska.


## Positiva erfarenheter

Något som gick bra med projektet var att arbeta med mysql och routes. Det gick smidigt att spara och hämta datan och genom att använda routes var det enkelt att förstå vilken del som gör vad. Varför detta gick så bra tror jag beror på den guiden vi hade för de tidigare projekten som använde sig av dem. Det gav en fårstålig kunskap om hur det används och vad det kan göra. Eftersom vi hade gjorde tidigare projekt som använde tekniken kunde man titta på den äldre koden för att förstå och lösa problem som uppstod.


## Negativa erfarenheter

En av de sakerna som gick sämre var att validera och implementera säkerhet på sidan. Det uppstod problem för jag visste inte hur jag skulle använda validator paketet från npm och de funktionerna som fanns. För att lösa det behövde jag läsa det som stog på sidan och klura med flera klasskamrater till vi sisst kom på hur det fungerade.

## Sammanfattning

I helhet är jag nöjd med projektet eftersom jag lyckades med att blanda de två tidigare projekten och sedan bygga vidare och förbättra det. Det finns fortfarande flera funktioner som till exempel kommentarer som man skulle kunna lägga till också att göra sidan snyggare med till exempel bootstrap. Men under arbetet har jag lärt mig mycket om hur man kan använda mysql databaser för att spara och visa information samt hur man använder sig av routes för att implementera funktioner och navigera sig på sidan.
