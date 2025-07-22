FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

COPY *.sln ./
COPY API/*.csproj ./API/
COPY Bussiness/*.csproj ./Bussiness/
COPY Data/*.csproj ./Data/

RUN dotnet restore FokkerahSolution.sln

COPY . ./

RUN dotnet publish API/API.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY --from=build /out ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "API.dll"]
