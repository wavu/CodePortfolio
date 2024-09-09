
CREATE FUNCTION [dbo].[TiempoLaboral] 
(
    @StartDate DATETIME,
    @FinishDate DATETIME
)
RETURNS BIGINT
AS
BEGIN
    DECLARE @Temp BIGINT
    SET @Temp=0

    DECLARE @FirstDay DATE
    SET @FirstDay = CONVERT(DATE, @StartDate, 112)

    DECLARE @LastDay DATE
    SET @LastDay = CONVERT(DATE, @FinishDate, 112)

    DECLARE @StartTime TIME
    SET @StartTime = CONVERT(TIME, @StartDate)

    DECLARE @FinishTime TIME
    SET @FinishTime = CONVERT(TIME, @FinishDate)

    DECLARE @WorkStart TIME
    SET @WorkStart = '07:30'

    DECLARE @WorkFinish TIME
    SET @WorkFinish = '17:30'

    DECLARE @LunchStart TIME
    SET @LunchStart = '12:20'
    
    DECLARE @LunchFinish TIME
    SET @LunchFinish = '13:30'

    DECLARE @DailyWorkTime BIGINT
    SET @DailyWorkTime = DATEDIFF(MINUTE, @WorkStart, @WorkFinish) - 70

    IF (@StartTime<@WorkStart)
    BEGIN
        SET @StartTime = @WorkStart
    END
    IF (@FinishTime>@WorkFinish)
    BEGIN
        SET @FinishTime=@WorkFinish
    END
    IF (@FinishTime<@WorkStart)
    BEGIN
        SET @FinishTime=@WorkStart
    END
    IF (@StartTime>@WorkFinish)
    BEGIN
        SET @StartTime = @WorkFinish
    END

    DECLARE @CurrentDate DATE
    SET @CurrentDate = @FirstDay
    DECLARE @LastDate DATE
    SET @LastDate = @LastDay

    WHILE(@CurrentDate<=@LastDate)
    BEGIN       
        IF (DATEPART(dw, @CurrentDate)!=1 AND DATEPART(dw, @CurrentDate)!=7)
        BEGIN
            IF (@CurrentDate!=@FirstDay) AND (@CurrentDate!=@LastDay)
            BEGIN
                SET @Temp = @Temp + @DailyWorkTime
            END
            --IF it starts at startdate and it finishes not this date find diff between work finish and start as minutes
            --Valida si la hora de inicio es menor que la hora del almuerzo para restarle 60 minutos de almuerzo
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate!=@LastDay) AND (@StartTime<=@LunchStart)  
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @StartTime, @WorkFinish) - 70
            END
            -- Calcula el tiempo cuando la hora de inicio es mayor que la hora de almuerzo
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate!=@LastDay)   
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @StartTime, @WorkFinish) 
            END
            -- Valida si la hora fin es mayor a la hora de almuerzo para restarle el tiempo del almuerzo
            ELSE IF (@CurrentDate!=@FirstDay) AND (@CurrentDate=@LastDay) AND (@FinishTime>=@LunchFinish)
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @WorkStart, @FinishTime) - 70
            END
            ELSE IF (@CurrentDate!=@FirstDay) AND (@CurrentDate=@LastDay) 
            BEGIN
                SET @Temp = @Temp + DATEDIFF(MINUTE, @WorkStart, @FinishTime)
            END
            
            --IF it starts and finishes in the same date
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate=@LastDay) AND (@StartTime<=@LunchStart) AND (@FinishTime>=@LunchFinish) 
            BEGIN
                SET @Temp = DATEDIFF(MINUTE, @StartTime, @FinishTime) - 70
            END
            ELSE IF (@CurrentDate=@FirstDay) AND (@CurrentDate=@LastDay)
            BEGIN
                SET @Temp = DATEDIFF(MINUTE, @StartTime, @FinishTime)
            END
        END
        SET @CurrentDate = DATEADD(day, 1, @CurrentDate)
    END

    -- Return the result of the function
    IF @Temp<0
    BEGIN
        SET @Temp=0
    END
    RETURN @Temp

END
GO
