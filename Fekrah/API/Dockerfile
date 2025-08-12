# ---------- Build ----------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# انسخ بس الـ .sln والـ .csproj الأول علشان الكاش
COPY FokkerahSolution.sln ./
COPY API/*.csproj ./API/
COPY Bussiness/*.csproj ./Bussiness/
COPY Data/*.csproj ./Data/

RUN dotnet restore FokkerahSolution.sln

# انسخ السورس المطلوب فقط
COPY API/ ./API/
COPY Bussiness/ ./Bussiness/
COPY Data/ ./Data/

# Publish بدون إعادة restore
RUN dotnet publish API/API.csproj -c Release --no-restore -o /out

# ---------- Runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# مهم: اربط Kestrel على كل الواجهات
ENV ASPNETCORE_URLS=http://+:5000 \
    DOTNET_EnableDiagnostics=0

COPY --from=build /out ./

EXPOSE 5000
ENTRYPOINT ["dotnet", "API.dll"]
