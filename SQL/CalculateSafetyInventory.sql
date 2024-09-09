CREATE FUNCTION dbo.CalculateSafetyInventory(@ITEMCODE  NVARCHAR(50)) RETURNS FLOAT
AS
BEGIN
    DECLARE @InventarioSeguridad FLOAT;

    SELECT @InventarioSeguridad = ROUND(ROUND(SQRT(SUM(Cuadrado) / COUNT(Cuadrado)), 2) * 0.524 * ((SELECT U_MESES FROM oitm WHERE ItemCode = @ARTICULO)*30), 0)
    FROM (
        SELECT ((ISNULL((T0.OutQty - T0.InQty), 0) - (T1.ConsumoUltTrimestre / T1.Media)) * (ISNULL((T0.OutQty - T0.InQty), 0) - (T1.ConsumoUltTrimestre / T1.Media))) AS Cuadrado
        FROM OIVL T0
        CROSS APPLY dbo.ConsumoPromMedia(@ARTICULO) AS T1
        WHERE T0.ItemCode = @ARTICULO
            AND T0.TransType IN ('13', '15')
            AND T0.LocCode IN ('01', '04', '07', '11', '02', '05', '08')
            AND T0.DocDate > EOMONTH(DATEADD(MM, -4, GETDATE()))
            AND T0.DocDate <= EOMONTH(DATEADD(MM, -1, GETDATE()))

        UNION ALL

        SELECT ((ISNULL((T0.OutQty - T0.InQty), 0) - (T1.ConsumoUltTrimestre / T1.Media)) * (ISNULL((T0.OutQty - T0.InQty), 0) - (T1.ConsumoUltTrimestre / T1.Media))) AS Cuadrado
        FROM OIVL T0
        CROSS APPLY dbo.ConsumoPromMedia(@ARTICULO) AS T1
        WHERE T0.ItemCode = @ARTICULO
            AND T0.TransType IN ('14', '16')
            AND T0.DocDate > EOMONTH(DATEADD(MM, -4, GETDATE()))
            AND T0.DocDate <= EOMONTH(DATEADD(MM, -1, GETDATE()))
    ) AS A0;

    RETURN @InventarioSeguridad;
END;
GO